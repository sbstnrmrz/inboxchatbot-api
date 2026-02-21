import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Message,
  MessageDocument,
  MessageChannel,
  MessageDirection,
  MessageType,
  MessageStatus,
  SenderType,
} from './schemas/message.schema.js';
import {
  Customer,
  CustomerDocument,
} from '../customers/schemas/customer.schema.js';
import {
  Conversation,
  ConversationDocument,
  ConversationChannel,
  ConversationStatus,
} from '../conversations/schemas/conversation.schema.js';
import { WhatsAppN8nWebhookItemDto } from './dto/whatsapp/whatsapp-n8n-webhook.dto.js';
import { InstagramWebhookDto } from './dto/instagram/instagram-webhook.dto.js';
import type { MessageReceivedDto } from './dto/message-received.dto.js';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema.js';
import { SendMessageDto } from './dto/send-message.dto.js';
import { WhatsAppSendMessageResponseDto } from './dto/whatsapp/whatsapp-send-message-response.dto.js';
import { ChatGateway } from '../chat/chat.gateway.js';
import { MessageEvent } from '../chat/enums/message-events.enum.js';
import { TenantsService } from '../tenants/tenants.service.js';
import {
  BotResponseDto,
  isInstagramMetaResponse,
} from './dto/bot-response.dto.js';
import { InstagramUserProfileDto } from './dto/instagram/instagram-user-profile.dto.js';
import { FilesService } from '../files/files.service.js';
import { FindMessagesDto } from './dto/find-messages.dto.js';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    @Inject(forwardRef(() => ChatGateway))
    private readonly chatGateway: ChatGateway,
    private readonly tenantsService: TenantsService,
    private readonly filesService: FilesService,
  ) {}

  /**
   * Returns a page of messages for a conversation, ordered newest-first.
   *
   * Uses cursor-based (keyset) pagination on `sentAt`:
   *   - First page: omit `before`
   *   - Next pages : pass `before` = sentAt of the oldest message in the previous page
   *
   * The caller must supply `tenantId` (resolved from the session by the
   * controller) so that the query is always tenant-scoped.
   */
  async findAll(
    tenantId: string,
    dto: FindMessagesDto,
  ): Promise<MessageDocument[]> {
    const { conversationId, before, limit = 20 } = dto;
    const tenantObjectId = new Types.ObjectId(tenantId);
    const conversationObjectId = new Types.ObjectId(conversationId);

    const filter: Record<string, unknown> = {
      tenantId: tenantObjectId,
      conversationId: conversationObjectId,
    };

    if (before) {
      filter['sentAt'] = { $lt: new Date(before) };
    }

    this.logger.debug('Sending all messages');
    return this.messageModel
      .find(filter)
      .sort({ sentAt: -1 })
      .limit(limit)
      .lean()
      .exec() as Promise<MessageDocument[]>;
  }

  async processWhatsAppWebhook(
    tenantId: string,
    payload: WhatsAppN8nWebhookItemDto,
  ): Promise<MessageDocument[]> {
    const { messages, contacts } = payload;

    if (!messages?.length) {
      this.logger.debug('WhatsApp webhook received with no messages, skipping');
      return [];
    }

    const tenantObjectId = new Types.ObjectId(tenantId);
    const savedMessages: MessageDocument[] = [];

    // Load tenant once to get the WhatsApp access token for media downloads
    const tenant = await this.tenantModel
      .findById(tenantObjectId)
      .lean()
      .exec();

    for (const waMessage of messages) {
      const contact = contacts?.find((c) => c.wa_id === waMessage.from);
      const displayName = contact?.profile?.name ?? waMessage.from;

      let customer = await this.customerModel
        .findOne({
          tenantId: tenantObjectId,
          'whatsappInfo.id': waMessage.from,
        })
        .lean()
        .exec();

      if (!customer) {
        this.logger.log(
          `Customer not found for wa_id=${waMessage.from}, creating new customer`,
        );
        customer = await this.customerModel.create({
          tenantId: tenantObjectId,
          name: displayName,
          whatsappInfo: {
            id: waMessage.from,
            name: displayName,
          },
        });
      }

      const customerObjectId = (customer as any)._id as Types.ObjectId;

      let conversation = await this.conversationModel
        .findOne({
          tenantId: tenantObjectId,
          customerId: customerObjectId,
          channel: ConversationChannel.WhatsApp,
          status: {
            $in: [ConversationStatus.Open, ConversationStatus.Pending],
          },
        })
        .lean()
        .exec();

      if (!conversation) {
        this.logger.log(
          `No active conversation found for customerId=${customerObjectId}, creating new conversation`,
        );
        conversation = await this.conversationModel.create({
          tenantId: tenantObjectId,
          customerId: customerObjectId,
          channel: ConversationChannel.WhatsApp,
          status: ConversationStatus.Open,
        });
      }

      const conversationObjectId = (conversation as any)._id as Types.ObjectId;

      const messageType = this.mapWhatsAppMessageType(waMessage.type);

      const mediaTypes: MessageType[] = [
        MessageType.Image,
        MessageType.Audio,
        MessageType.Video,
        MessageType.Document,
        MessageType.Sticker,
      ];

      const rawMedia =
        waMessage.image ??
        waMessage.audio ??
        waMessage.video ??
        waMessage.document ??
        waMessage.sticker ??
        null;

      const media =
        rawMedia && mediaTypes.includes(messageType)
          ? {
              whatsappMediaId: rawMedia.id,
              mimeType: rawMedia.mime_type,
              sha256: rawMedia.sha256,
              caption: rawMedia.caption,
              filename: (rawMedia as any).filename,
            }
          : undefined;

      const sentAt = new Date(Number(waMessage.timestamp) * 1000);

      const message = await this.messageModel.create({
        tenantId: tenantObjectId,
        conversationId: conversationObjectId,
        channel: MessageChannel.WhatsApp,
        direction: MessageDirection.Inbound,
        messageType,
        sender: {
          type: SenderType.Customer,
          id: customerObjectId,
        },
        body: waMessage.text?.body,
        media,
        externalId: waMessage.id,
        status: MessageStatus.Delivered,
        sentAt,
      });

      await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
        lastMessage: message._id,
        lastMessageAt: sentAt,
        $inc: { unreadCount: 1 },
      });

      savedMessages.push(message);

      // ── Emit real-time event to tenant room ────────────────────────────
      this.chatGateway.emitToTenant(tenantId, MessageEvent.Received, message);

      // ── Fire-and-forget media download ─────────────────────────────────
      // Kicked off asynchronously so it never blocks the webhook response.
      if (media?.whatsappMediaId && tenant?.whatsappInfo?.accessToken) {
        const mediaTypeSlug = waMessage.type; // e.g. "image", "video", "audio"
        this.filesService
          .downloadWhatsAppMedia(
            tenantId,
            media.whatsappMediaId,
            mediaTypeSlug,
            tenant.whatsappInfo.accessToken,
          )
          .catch((err: unknown) => {
            this.logger.error(
              `[WA] Failed to download media mediaId=${media.whatsappMediaId}: ${(err as Error).message}`,
            );
          });
      }
    }

    return savedMessages;
  }

  async processInstagramWebhook(
    tenantId: string,
    payload: InstagramWebhookDto,
  ): Promise<MessageDocument[]> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const savedMessages: MessageDocument[] = [];

    // Load tenant once to get the Instagram access token for profile lookups
    const tenant = await this.tenantModel
      .findById(tenantObjectId)
      .lean()
      .exec();

    for (const entry of payload.entry) {
      if (!entry.messaging?.length) continue;

      for (const event of entry.messaging) {
        // Only process actual messages — skip reads, reactions, postbacks
        if (!event.message) continue;

        // Skip echoes (messages sent by the business account itself)
        if (event.message.is_echo) continue;

        const senderId = event.sender.id;

        // ── 1. Find or create customer ──────────────────────────────────────
        let customer = await this.customerModel
          .findOne({
            tenantId: tenantObjectId,
            'instagramInfo.accountId': senderId,
          })
          .lean()
          .exec();

        if (!customer) {
          this.logger.log(
            `Customer not found for ig_scoped_id=${senderId}, creating new customer`,
          );

          // Fetch Instagram profile to enrich the customer record
          let profile: InstagramUserProfileDto | null = null;
          if (tenant?.instagramInfo?.accessToken) {
            profile = await this.getInstagramUserProfile(
              senderId,
              tenant.instagramInfo.accessToken,
            ).catch((err: unknown) => {
              this.logger.warn(
                `[IG] Could not fetch profile for ig_scoped_id=${senderId}: ${(err as Error).message}`,
              );
              return null;
            });
          }

          customer = await this.customerModel.create({
            tenantId: tenantObjectId,
            name: profile?.name ?? profile?.username ?? senderId,
            instagramInfo: {
              accountId: senderId,
              username: profile?.username,
              profilePic: profile?.profile_pic,
            },
          });
        }

        const customerObjectId = (customer as any)._id as Types.ObjectId;

        // ── 2. Find or create active conversation ───────────────────────────
        let conversation = await this.conversationModel
          .findOne({
            tenantId: tenantObjectId,
            customerId: customerObjectId,
            channel: ConversationChannel.Instagram,
            status: {
              $in: [ConversationStatus.Open, ConversationStatus.Pending],
            },
          })
          .lean()
          .exec();

        if (!conversation) {
          this.logger.log(
            `No active Instagram conversation for customerId=${customerObjectId}, creating`,
          );
          conversation = await this.conversationModel.create({
            tenantId: tenantObjectId,
            customerId: customerObjectId,
            channel: ConversationChannel.Instagram,
            status: ConversationStatus.Open,
          });
        }

        const conversationObjectId = (conversation as any)
          ._id as Types.ObjectId;

        // ── 3. Map message type & media ─────────────────────────────────────
        const attachment = event.message.attachments?.[0];
        const messageType = this.mapInstagramMessageType(
          event.message.text,
          attachment?.type,
        );

        const media = attachment?.payload?.url
          ? { url: attachment.payload.url }
          : undefined;

        // ── 4. Persist message ──────────────────────────────────────────────
        const sentAt = new Date(event.timestamp * 1000);

        const message = await this.messageModel.create({
          tenantId: tenantObjectId,
          conversationId: conversationObjectId,
          channel: MessageChannel.Instagram,
          direction: MessageDirection.Inbound,
          messageType,
          sender: {
            type: SenderType.Customer,
            id: customerObjectId,
          },
          body: event.message.text,
          media,
          externalId: event.message.mid,
          status: MessageStatus.Delivered,
          sentAt,
        });

        // ── 5. Update conversation lastMessage ──────────────────────────────
        await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
          lastMessage: message._id,
          lastMessageAt: sentAt,
          $inc: { unreadCount: 1 },
        });

        savedMessages.push(message);

        // ── Emit real-time event to tenant room ──────────────────────────────
        this.chatGateway.emitToTenant(tenantId, MessageEvent.Received, message);

        // ── Fire-and-forget media download ──────────────────────────────────
        // Instagram CDN URLs expire, so we download immediately on receipt.
        if (attachment?.payload?.url) {
          const mediaTypeSlug = attachment.type; // e.g. "image", "video"
          const mimeType = this.mimeTypeFromInstagramAttachment(
            attachment.type,
          );
          // Use the message's external ID (mid) as the stable cache key
          const cacheId = event.message.mid;

          this.filesService
            .downloadInstagramMedia(
              tenantId,
              cacheId,
              mediaTypeSlug,
              attachment.payload.url,
              mimeType,
            )
            .catch((err: unknown) => {
              this.logger.error(
                `[IG] Failed to download media mid=${cacheId}: ${(err as Error).message}`,
              );
            });
        }
      }
    }

    return savedMessages;
  }

  async sendMessage(
    tenantId: string,
    agentId: string,
    dto: SendMessageDto,
  ): Promise<MessageDocument> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    // ── 1. Load conversation to get channel + customer ────────────────────
    const conversation = await this.conversationModel
      .findOne({ _id: dto.conversationId, tenantId: tenantObjectId })
      .lean()
      .exec();

    if (!conversation) {
      throw new Error(`Conversation ${dto.conversationId} not found`);
    }

    const conversationObjectId = (conversation as any)._id as Types.ObjectId;

    // ── 2. Load tenant to get channel credentials ─────────────────────────
    const tenant = await this.tenantModel
      .findById(tenantObjectId)
      .lean()
      .exec();

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // ── 3. Load customer to get channel-specific recipient ID ─────────────
    const customer = await this.customerModel
      .findOne({ _id: conversation.customerId, tenantId: tenantObjectId })
      .lean()
      .exec();

    if (!customer) {
      throw new Error(
        `Customer not found for conversation ${dto.conversationId}`,
      );
    }

    const sentAt = new Date();
    let externalId: string | undefined;

    // ── 4. Send via channel API ───────────────────────────────────────────
    if (conversation.channel === ConversationChannel.WhatsApp) {
      const waInfo = tenant.whatsappInfo;
      if (!waInfo) throw new Error(`Tenant ${tenantId} has no WhatsApp config`);

      const recipientId = (customer as any).whatsappInfo?.id;
      if (!recipientId) throw new Error(`Customer has no WhatsApp ID`);

      const waResponse = await this.callWhatsAppApi(
        waInfo.phoneNumberId,
        waInfo.accessToken,
        recipientId,
        dto,
      );

      externalId = waResponse.messages[0]?.id;
    } else if (conversation.channel === ConversationChannel.Instagram) {
      const igInfo = tenant.instagramInfo;
      if (!igInfo)
        throw new Error(`Tenant ${tenantId} has no Instagram config`);

      const recipientId = (customer as any).instagramInfo?.accountId;
      if (!recipientId) throw new Error(`Customer has no Instagram ID`);

      const igResponse = await this.callInstagramApi(
        igInfo.accountId,
        igInfo.accessToken,
        recipientId,
        dto,
      );

      externalId = igResponse.message_id;
    }

    // ── 5. Persist message ────────────────────────────────────────────────
    const message = await this.messageModel.create({
      tenantId: tenantObjectId,
      conversationId: conversationObjectId,
      channel: conversation.channel,
      direction: MessageDirection.Outbound,
      messageType: dto.messageType,
      sender: {
        type: SenderType.User,
        id: new Types.ObjectId(agentId),
      },
      body: dto.body,
      media: dto.media,
      externalId,
      status: MessageStatus.Sent,
      sentAt,
    });

    // ── 6. Update conversation lastMessage ────────────────────────────────
    await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
      lastMessage: message._id,
      lastMessageAt: sentAt,
    });

    // ── 7. Emit real-time event to all agents in the tenant room ──────────
    this.chatGateway.emitToTenant(tenantId, MessageEvent.Sent, message);

    return message;
  }

  // ── Channel API callers (thin wrappers — easy to mock in tests) ──────────

  async callWhatsAppApi(
    phoneNumberId: string,
    accessToken: string,
    recipientId: string,
    dto: SendMessageDto,
  ): Promise<WhatsAppSendMessageResponseDto> {
    const body: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientId,
      type: dto.messageType.toLowerCase(),
    };

    if (dto.messageType === MessageType.Text) {
      body['text'] = { body: dto.body };
    } else if (dto.media) {
      body[dto.messageType.toLowerCase()] = {
        id: dto.media.whatsappMediaId,
        link: dto.media.url,
        caption: dto.media.caption,
        filename: dto.media.filename,
      };
    }

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    return response.json() as Promise<WhatsAppSendMessageResponseDto>;
  }

  /**
   * Fetches an Instagram user's profile information using their Instagram-scoped ID (IGSID).
   * Requires user consent — the user must have sent a message to the business account first.
   *
   * @see https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/messaging-api/user-profile
   */
  async getInstagramUserProfile(
    igScopedId: string,
    accessToken: string,
  ): Promise<InstagramUserProfileDto> {
    const fields = [
      'name',
      'username',
      'profile_pic',
      'follower_count',
      'is_user_follow_business',
      'is_business_follow_user',
      'is_verified_user',
    ].join(',');

    const url = new URL(`https://graph.instagram.com/v19.0/${igScopedId}`);
    url.searchParams.set('fields', fields);
    url.searchParams.set('access_token', accessToken);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Instagram User Profile API error ${response.status}: ${errorBody}`,
      );
    }

    return response.json() as Promise<InstagramUserProfileDto>;
  }

  async callInstagramApi(
    igUserId: string,
    accessToken: string,
    recipientId: string,
    dto: SendMessageDto,
  ): Promise<{ message_id: string }> {
    const body: Record<string, unknown> = {
      recipient: { id: recipientId },
    };

    if (dto.messageType === MessageType.Text) {
      body['message'] = { text: dto.body };
    } else if (dto.media) {
      body['message'] = {
        attachment: {
          type: dto.messageType.toLowerCase(),
          payload: { url: dto.media.url },
        },
      };
    }

    const response = await fetch(
      `https://graph.instagram.com/v23.0/${igUserId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status}`);
    }

    return response.json() as Promise<{ message_id: string }>;
  }

  async processBotResponse(dto: BotResponseDto): Promise<MessageDocument> {
    // ── 1. Resolve tenantId (accepts slug or ObjectId) ────────────────────
    const resolvedTenantId = await this.tenantsService.resolveId(dto.tenantId);
    const tenantObjectId = new Types.ObjectId(resolvedTenantId);

    // ── 2. Validate tenant exists ─────────────────────────────────────────
    const tenantExists = await this.tenantModel
      .exists({ _id: tenantObjectId })
      .exec();

    if (!tenantExists) {
      throw new Error(`Tenant ${dto.tenantId} not found`);
    }

    // ── 3. Detect channel from metaResponse shape and extract recipientId ──
    let recipientId: string;
    let channel: ConversationChannel;
    let messageChannel: MessageChannel;
    let customerFilter: Record<string, unknown>;
    let customerCreateData: Record<string, unknown>;

    if (isInstagramMetaResponse(dto.metaResponse)) {
      recipientId = dto.metaResponse.recipient_id;
      channel = ConversationChannel.Instagram;
      messageChannel = MessageChannel.Instagram;
      customerFilter = {
        tenantId: tenantObjectId,
        'instagramInfo.accountId': recipientId,
      };
      customerCreateData = {
        tenantId: tenantObjectId,
        name: recipientId,
        instagramInfo: { accountId: recipientId, name: recipientId },
      };
    } else {
      recipientId = dto.metaResponse.contacts?.[0]?.wa_id ?? '';
      channel = ConversationChannel.WhatsApp;
      messageChannel = MessageChannel.WhatsApp;
      customerFilter = {
        tenantId: tenantObjectId,
        'whatsappInfo.id': recipientId,
      };
      customerCreateData = {
        tenantId: tenantObjectId,
        name: recipientId,
        whatsappInfo: { id: recipientId, name: recipientId },
      };
    }

    // ── 4. Find or create customer by recipientId ─────────────────────────
    let customer = await this.customerModel
      .findOne(customerFilter)
      .lean()
      .exec();

    if (!customer) {
      this.logger.log(
        `Customer not found for recipientId=${recipientId} (${channel}), creating new customer`,
      );
      customer = await this.customerModel.create(customerCreateData);
    }

    const customerObjectId = (customer as any)._id as Types.ObjectId;

    // ── 5. Find or create active conversation ─────────────────────────────
    let conversation = await this.conversationModel
      .findOne({
        tenantId: tenantObjectId,
        customerId: customerObjectId,
        channel,
        status: { $in: [ConversationStatus.Open, ConversationStatus.Pending] },
      })
      .lean()
      .exec();

    if (!conversation) {
      this.logger.log(
        `No active ${channel} conversation for customerId=${customerObjectId}, creating`,
      );
      conversation = await this.conversationModel.create({
        tenantId: tenantObjectId,
        customerId: customerObjectId,
        channel,
        status: ConversationStatus.Open,
      });
    }

    const conversationObjectId = (conversation as any)._id as Types.ObjectId;

    // ── 6. Extract externalId from Meta response ──────────────────────────
    let externalId: string | undefined;
    if (isInstagramMetaResponse(dto.metaResponse)) {
      externalId = dto.metaResponse.message_id;
    } else {
      externalId = dto.metaResponse.messages?.[0]?.id;
    }

    const sentAt = new Date();

    // ── 7. Persist message ────────────────────────────────────────────────
    const message = await this.messageModel.create({
      tenantId: tenantObjectId,
      conversationId: conversationObjectId,
      channel: messageChannel,
      direction: MessageDirection.Outbound,
      messageType: dto.messageType ?? MessageType.Text,
      sender: { type: SenderType.Bot },
      body: dto.content,
      media: dto.media,
      externalId,
      status: MessageStatus.Sent,
      sentAt,
    });

    // ── 8. Update conversation lastMessage ────────────────────────────────
    await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
      lastMessage: message._id,
      lastMessageAt: sentAt,
    });

    // ── 9. Emit real-time event ───────────────────────────────────────────
    this.chatGateway.emitToTenant(resolvedTenantId, MessageEvent.Sent, message);

    return message;
  }

  /**
   * Unified entry point called by the n8n workflow.
   * Detects the channel from the payload and delegates to the appropriate
   * processor:
   *   - WhatsApp : payload.messaging_product === 'whatsapp'
   *   - Instagram: payload.object === 'instagram'
   */
  async messageReceived(
    tenantId: string,
    payload: MessageReceivedDto,
  ): Promise<MessageDocument[]> {
    const resolvedTenantId = await this.tenantsService.resolveId(tenantId);

    if (
      (payload as WhatsAppN8nWebhookItemDto).messaging_product === 'whatsapp'
    ) {
      this.logger.log(`[messageReceived] Channel detected: WhatsApp`);
      return this.processWhatsAppWebhook(
        resolvedTenantId,
        payload as WhatsAppN8nWebhookItemDto,
      );
    }

    if ((payload as InstagramWebhookDto).object === 'instagram') {
      this.logger.log(`[messageReceived] Channel detected: Instagram`);
      return this.processInstagramWebhook(
        resolvedTenantId,
        payload as InstagramWebhookDto,
      );
    }

    this.logger.warn(
      `[messageReceived] Unknown channel payload — skipping. payload keys: ${Object.keys(payload).join(', ')}`,
    );
    return [];
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private mapWhatsAppMessageType(type: string): MessageType {
    const map: Record<string, MessageType> = {
      text: MessageType.Text,
      image: MessageType.Image,
      audio: MessageType.Audio,
      video: MessageType.Video,
      document: MessageType.Document,
      sticker: MessageType.Sticker,
      location: MessageType.Location,
      contacts: MessageType.Contacts,
      interactive: MessageType.Interactive,
      button: MessageType.Button,
      reaction: MessageType.Reaction,
      order: MessageType.Order,
      system: MessageType.System,
    };
    return map[type] ?? MessageType.Unknown;
  }

  /**
   * Maps Instagram attachment type to internal MessageType.
   * If text is present and no attachment, it's a TEXT message.
   */
  private mapInstagramMessageType(
    text: string | undefined,
    attachmentType: string | undefined,
  ): MessageType {
    if (attachmentType) {
      const map: Record<string, MessageType> = {
        image: MessageType.Image,
        audio: MessageType.Audio,
        video: MessageType.Video,
        file: MessageType.Document,
        reel: MessageType.Reel,
        ig_reel: MessageType.Reel,
        share: MessageType.Share,
        like_heart: MessageType.Sticker,
      };
      return map[attachmentType] ?? MessageType.Unknown;
    }
    return text ? MessageType.Text : MessageType.Unknown;
  }

  /**
   * Maps an Instagram attachment type string to its primary MIME type.
   * Used when storing the file so it receives the correct extension.
   */
  private mimeTypeFromInstagramAttachment(attachmentType: string): string {
    const map: Record<string, string> = {
      image: 'image/jpeg',
      audio: 'audio/mpeg',
      video: 'video/mp4',
      file: 'application/octet-stream',
      reel: 'video/mp4',
      ig_reel: 'video/mp4',
      share: 'image/jpeg',
      like_heart: 'image/webp',
    };
    return map[attachmentType] ?? 'application/octet-stream';
  }
}
