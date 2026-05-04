import { forwardRef, Inject, Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  MessageReceivedResult,
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
import { ConversationEvent } from '../chat/enums/conversation-events.enum.js';
import { TagEvent } from '../chat/enums/tag-events.enum.js';
import { TenantsService } from '../tenants/tenants.service.js';
import {
  BotResponseDto,
  isInstagramMetaResponse,
} from './dto/bot-response.dto.js';
import { InstagramUserProfileDto } from './dto/instagram/instagram-user-profile.dto.js';
import { FilesService } from '../files/files.service.js';
import { FindMessagesDto } from './dto/find-messages.dto.js';
import { CountMessagesDto } from './dto/count-messages.dto.js';
import { TagsService } from '../tags/tags.service.js';

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
    private readonly tagsService: TagsService,
    private readonly configService: ConfigService,
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

  async count(
    tenantId: string,
    dto: CountMessagesDto = {},
  ): Promise<{ total: number; whatsapp: number; instagram: number }> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const match: Record<string, unknown> = { tenantId: tenantObjectId };

    if (dto.date) {
      const start = new Date(dto.date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(dto.date);
      end.setUTCHours(23, 59, 59, 999);
      match['sentAt'] = { $gte: start, $lte: end };
    } else if (dto.from || dto.to) {
      const range: Record<string, Date> = {};
      if (dto.from) range['$gte'] = new Date(dto.from);
      if (dto.to) {
        const end = new Date(dto.to);
        if (!/T\d{2}:\d{2}/.test(dto.to)) end.setUTCHours(23, 59, 59, 999);
        range['$lte'] = end;
      }
      match['sentAt'] = range;
    }

    const rows = await this.messageModel.aggregate<{ channel: string; count: number }>([
      { $match: match },
      { $group: { _id: '$channel', count: { $sum: 1 } } },
      { $project: { _id: 0, channel: '$_id', count: 1 } },
    ]);

    const result = { total: 0, whatsapp: 0, instagram: 0 };
    for (const row of rows) {
      const key = row.channel.toLowerCase() as 'whatsapp' | 'instagram';
      result[key] = row.count;
      result.total += row.count;
    }

    return result;
  }

  async processWhatsAppWebhook(
    tenantId: string,
    payload: WhatsAppN8nWebhookItemDto,
    execId?: string,
  ): Promise<MessageReceivedResult[]> {
    const { messages, contacts } = payload;
    this.logger.debug('Received WhatsApp Messsage');
    this.logger.debug(payload);

    if (!messages?.length) {
      this.logger.debug('WhatsApp webhook received with no messages, skipping');
      return [];
    }

    const tenantObjectId = new Types.ObjectId(tenantId);
    const savedMessages: MessageReceivedResult[] = [];

    // Load tenant once to get the WhatsApp access token for media downloads
    const tenant = await this.tenantModel
      .findById(tenantObjectId)
      .lean()
      .exec();

    if (!tenant) {
      this.logger.warn(`[WA] Tenant ${tenantId} not found, skipping webhook`);
      return [];
    }

    // Guard: verify the webhook phone_number_id matches this tenant's config
    const incomingPhoneNumberId = payload.metadata?.phone_number_id;
    if (
      tenant.whatsappInfo?.phoneNumberId &&
      incomingPhoneNumberId &&
      incomingPhoneNumberId !== tenant.whatsappInfo.phoneNumberId
    ) {
      this.logger.warn(
        `[WA] Webhook phone_number_id=${incomingPhoneNumberId} does not match tenant ${tenantId} phoneNumberId=${tenant.whatsappInfo.phoneNumberId} — skipping`,
      );
      return [];
    }

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
              id: rawMedia.id,
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
        execId,
      });

      await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
        lastMessage: message._id,
        lastMessageAt: sentAt,
        $inc: { unreadCount: 1 },
      });

      savedMessages.push({
        message,
        isBlocked: (customer as any).isBlocked ?? false,
        botEnabled: (conversation as any).botEnabled ?? true,
      });

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
    execId?: string,
  ): Promise<MessageReceivedResult[]> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const savedMessages: MessageReceivedResult[] = [];

    this.logger.debug('Received Instagram Messsage');
    this.logger.debug(payload);

    // Load tenant once to get the Instagram access token for profile lookups
    const tenant = await this.tenantModel
      .findById(tenantObjectId)
      .lean()
      .exec();

    if (!tenant) {
      this.logger.warn(`[IG] Tenant ${tenantId} not found, skipping webhook`);
      return [];
    }

    for (const entry of payload.entry) {
      if (!entry.messaging?.length) continue;

      // Guard: verify the entry recipient matches this tenant's Instagram account
      if (
        tenant.instagramInfo?.accountId &&
        entry.id !== tenant.instagramInfo.accountId
      ) {
        this.logger.warn(
          `[IG] Webhook entry.id=${entry.id} does not match tenant ${tenantId} accountId=${tenant.instagramInfo.accountId} — skipping`,
        );
        continue;
      }

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
          this.logger.debug('Message Created');
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

        const attachmentMimeType = attachment
          ? this.mimeTypeFromInstagramAttachment(attachment.type)
          : undefined;

        const media = attachment?.payload?.url
          ? {
              id: event.message.mid,
              url: attachment.payload.url,
              mimeType: attachmentMimeType,
            }
          : undefined;

        // ── 4. Persist message ──────────────────────────────────────────────
        const rawTimestamp = event.timestamp;
        const timestampInMs =
          rawTimestamp < 10000000000 ? rawTimestamp * 1000 : rawTimestamp;
        const sentAt = new Date(timestampInMs);

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
          execId,
        });

        // ── 5. Update conversation lastMessage ──────────────────────────────
        await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
          lastMessage: message._id,
          lastMessageAt: sentAt,
          $inc: { unreadCount: 1 },
        });

        savedMessages.push({
          message,
          isBlocked: (customer as any).isBlocked ?? false,
          botEnabled: (conversation as any).botEnabled ?? true,
        });

        // ── Emit real-time event to tenant room ──────────────────────────────
        this.chatGateway.emitToTenant(tenantId, MessageEvent.Received, message);

        // ── Fire-and-forget media download ──────────────────────────────────
        // Instagram CDN URLs expire, so we download immediately on receipt.
        if (attachment?.payload?.url && attachmentMimeType) {
          const mediaTypeSlug = attachment.type; // e.g. "image", "video"
          // Use the message's external ID (mid) as the stable cache key
          const cacheId = event.message.mid;

          this.filesService
            .downloadInstagramMedia(
              tenantId,
              cacheId,
              mediaTypeSlug,
              attachment.payload.url,
              attachmentMimeType,
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
          payload: { url: dto.media.url, is_reusable: true },
        },
      };
    }

    this.logger.debug(`[IG] Sending to ${igUserId}: ${JSON.stringify(body)}`);

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
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Instagram API error: ${response.status} — ${errorBody}`);
    }

    return response.json() as Promise<{ message_id: string }>;
  }

  async processBotResponse(
    dto: BotResponseDto,
    requestAgent?: boolean,
    addTags?: { name: string; color?: string }[],
    removeTags?: string[],
    removeAllTags?: boolean,
    execId?: string,
  ): Promise<MessageDocument> {
    // ── 1. Resolve tenantId (accepts slug or ObjectId) ────────────────────
    const resolvedTenantId = await this.tenantsService.resolveId(dto.tenantId);
    const tenantObjectId = new Types.ObjectId(resolvedTenantId);
    this.logger.debug('Sending Bot Response');
    this.logger.debug(dto);

    // ── 2. Validate tenant exists ─────────────────────────────────────────
    const tenant = await this.tenantModel
      .findById(tenantObjectId)
      .lean()
      .exec();

    if (!tenant) {
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
        instagramInfo: { accountId: recipientId },
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

      if (
        isInstagramMetaResponse(dto.metaResponse) &&
        tenant.instagramInfo?.accessToken
      ) {
        const profile = await this.getInstagramUserProfile(
          recipientId,
          tenant.instagramInfo.accessToken,
        ).catch((err: unknown) => {
          this.logger.warn(
            `[IG] Could not fetch profile for ig_scoped_id=${recipientId}: ${(err as Error).message}`,
          );
          return null;
        });

        customerCreateData = {
          tenantId: tenantObjectId,
          name: profile?.name ?? profile?.username ?? recipientId,
          instagramInfo: {
            accountId: recipientId,
            name: profile?.name,
            username: profile?.username,
            profilePic: profile?.profile_pic,
          },
        };
      }

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
      execId,
    });

    // ── 8. Update conversation lastMessage ────────────────────────────────
    await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
      lastMessage: message._id,
      lastMessageAt: sentAt,
    });

    // ── 9. Emit real-time event ───────────────────────────────────────────
    this.chatGateway.emitToTenant(resolvedTenantId, MessageEvent.Sent, message);

    // ── 10. Handle request_agent flag ─────────────────────────────────────
    if (requestAgent) {
      await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
        requestingAgent: true,
      });
      this.chatGateway.emitToTenant(
        resolvedTenantId,
        ConversationEvent.RequestAgent,
        { conversationId: conversationObjectId },
      );
    }

    // ── 11. Handle remove_all_tags ────────────────────────────────────────
    if (removeAllTags) {
      const updated = await this.conversationModel
        .findByIdAndUpdate(
          conversationObjectId,
          { $set: { tags: [] } },
          { new: true },
        )
        .select('tags')
        .lean()
        .exec();
      if (updated) {
        this.chatGateway.emitToTenant(resolvedTenantId, TagEvent.RemovedFromConversation, {
          conversationId: conversationObjectId.toString(),
          tags: [],
        });
      }
    }

    // ── 12. Handle add_tags ───────────────────────────────────────────────
    if (addTags && addTags.length > 0) {
      const tagIds = await this.tagsService.findOrCreateByNames(
        resolvedTenantId,
        addTags,
      );
      const updated = await this.conversationModel
        .findByIdAndUpdate(
          conversationObjectId,
          { $addToSet: { tags: { $each: tagIds } } },
          { new: true },
        )
        .select('tags')
        .lean()
        .exec();
      if (updated) {
        this.chatGateway.emitToTenant(resolvedTenantId, TagEvent.AddedToConversation, {
          conversationId: conversationObjectId.toString(),
          tags: (updated.tags as Types.ObjectId[]).map((id) => id.toString()),
        });
      }
    }

    // ── 12. Handle remove_tags ────────────────────────────────────────────
    if (removeTags && removeTags.length > 0) {
      const tagIds = await this.tagsService.findOrCreateByNames(
        resolvedTenantId,
        removeTags.map((name) => ({ name })),
      );
      const updated = await this.conversationModel
        .findByIdAndUpdate(
          conversationObjectId,
          { $pullAll: { tags: tagIds } },
          { new: true },
        )
        .select('tags')
        .lean()
        .exec();
      if (updated) {
        this.chatGateway.emitToTenant(resolvedTenantId, TagEvent.RemovedFromConversation, {
          conversationId: conversationObjectId.toString(),
          tags: (updated.tags as Types.ObjectId[]).map((id) => id.toString()),
        });
      }
    }

    return message;
  }

  /**
   * Handles an image (or other media) uploaded by an agent from the UI.
   *
   * Flow:
   *   1. Save the file locally under uploads/{tenantId}/client/{mediaType}/
   *   2. Upload the binary to the channel's media API to obtain a stable media ID
   *   3. Send the message via the channel API
   *   4. Persist + emit the outbound message just like sendMessage does
   *
   * For Instagram the file is served from this API at a public URL
   * (requires BASE_URL env var) because the IG API accepts URLs, not uploads.
   */
  async sendMediaMessage(
    tenantId: string,
    agentId: string,
    conversationId: string,
    file: Express.Multer.File,
    caption?: string,
  ): Promise<MessageDocument> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    const conversation = await this.conversationModel
      .findOne({ _id: conversationId, tenantId: tenantObjectId })
      .lean()
      .exec();
    if (!conversation) throw new BadRequestException(`Conversation ${conversationId} not found`);

    const tenant = await this.tenantModel.findById(tenantObjectId).lean().exec();
    if (!tenant) throw new BadRequestException(`Tenant ${tenantId} not found`);

    const customer = await this.customerModel
      .findOne({ _id: conversation.customerId, tenantId: tenantObjectId })
      .lean()
      .exec();
    if (!customer) throw new BadRequestException(`Customer not found`);

    // Save locally under the channel folder — consistent with inbound media storage
    const channel = conversation.channel.toLowerCase(); // "whatsapp" | "instagram"
    const { fileId, mimeType } = this.filesService.saveUploadedFile(tenantId, channel, file);
    const mediaType = mimeType.split('/')[0]; // "image", "video", etc.
    const messageType = this.mimeTypeToMessageType(mimeType);

    const sentAt = new Date();
    let externalId: string | undefined;
    let media: Record<string, unknown>;

    if (conversation.channel === ConversationChannel.WhatsApp) {
      const waInfo = tenant.whatsappInfo;
      if (!waInfo) throw new BadRequestException(`Tenant has no WhatsApp config`);

      const recipientId = (customer as any).whatsappInfo?.id;
      if (!recipientId) throw new BadRequestException(`Customer has no WhatsApp ID`);

      // Upload binary to WA and get a stable media ID
      const whatsappMediaId = await this.filesService.uploadToWhatsAppMedia(
        waInfo.phoneNumberId,
        waInfo.accessToken,
        file,
      );

      const waResponse = await this.callWhatsAppApi(
        waInfo.phoneNumberId,
        waInfo.accessToken,
        recipientId,
        {
          conversationId,
          messageType,
          media: { whatsappMediaId, mimeType, caption },
        },
      );

      externalId = waResponse.messages[0]?.id;
      media = { id: fileId, whatsappMediaId, mimeType, caption };

    } else if (conversation.channel === ConversationChannel.Instagram) {
      const igInfo = tenant.instagramInfo;
      if (!igInfo) throw new BadRequestException(`Tenant has no Instagram config`);

      const recipientId = (customer as any).instagramInfo?.accountId;
      if (!recipientId) throw new BadRequestException(`Customer has no Instagram ID`);

      const baseUrl = this.configService.get<string>('BASE_URL');
      if (!baseUrl) throw new Error('BASE_URL env var is not set — required for Instagram media messages');

      // Instagram DM only accepts JPEG and PNG for image attachments
      if (mediaType === 'image' && mimeType !== 'image/jpeg' && mimeType !== 'image/png') {
        throw new BadRequestException(
          `Instagram only supports JPEG and PNG images. Received: ${mimeType}`,
        );
      }

      // Must be a public URL — Instagram's servers fetch it without auth cookies
      const url = `${baseUrl}/files/public/${tenantId}/${channel}/${mediaType}/${fileId}`;

      const igResponse = await this.callInstagramApi(
        igInfo.accountId,
        igInfo.accessToken,
        recipientId,
        {
          conversationId,
          messageType,
          media: { url, mimeType, caption },
        },
      );

      externalId = igResponse.message_id;
      media = { id: fileId, url, mimeType, caption };


    } else {
      throw new BadRequestException(`Unsupported channel: ${conversation.channel}`);
    }

    const message = await this.messageModel.create({
      tenantId: tenantObjectId,
      conversationId: new Types.ObjectId(conversationId),
      channel: conversation.channel as unknown as MessageChannel,
      direction: MessageDirection.Outbound,
      messageType,
      sender: { type: SenderType.User, id: new Types.ObjectId(agentId) },
      media,
      externalId,
      status: MessageStatus.Sent,
      sentAt,
    });

    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: sentAt,
    });

    this.chatGateway.emitToTenant(tenantId, MessageEvent.Sent, message);

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
    execId?: string,
  ): Promise<MessageReceivedResult[]> {
    const resolvedTenantId = await this.tenantsService.resolveId(tenantId);

    if (
      (payload as WhatsAppN8nWebhookItemDto).messaging_product === 'whatsapp'
    ) {
      this.logger.debug(`[messageReceived] Channel detected: WhatsApp`);
      return this.processWhatsAppWebhook(
        resolvedTenantId,
        payload as WhatsAppN8nWebhookItemDto,
        execId,
      );
    }

    if ((payload as InstagramWebhookDto).object === 'instagram') {
      this.logger.debug(`[messageReceived] Channel detected: Instagram`);
      return this.processInstagramWebhook(
        resolvedTenantId,
        payload as InstagramWebhookDto,
        execId,
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

  private mimeTypeToMessageType(mimeType: string): MessageType {
    const prefix = mimeType.split('/')[0];
    if (prefix === 'image') return MessageType.Image;
    if (prefix === 'video') return MessageType.Video;
    if (prefix === 'audio') return MessageType.Audio;
    if (mimeType === 'application/pdf') return MessageType.Document;
    return MessageType.Document;
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
