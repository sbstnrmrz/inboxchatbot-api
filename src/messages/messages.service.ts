import { Injectable, Logger } from '@nestjs/common';
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
import { InstagramWebhookEntryDto } from './dto/instagram/instagram-webhook-entry.dto.js';

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
  ) {}

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

    for (const waMessage of messages) {
      // ── 1. Resolve contact name from contacts array ──────────────────────
      const contact = contacts?.find((c) => c.wa_id === waMessage.from);
      const displayName = contact?.profile?.name ?? waMessage.from;

      // ── 2. Find or create customer ───────────────────────────────────────
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

      // ── 3. Find or create active conversation ────────────────────────────
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

      // ── 4. Map message type ───────────────────────────────────────────────
      const messageType = this.mapWhatsAppMessageType(waMessage.type);

      // ── 5. Build media payload if applicable ─────────────────────────────
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

      // ── 6. Persist message ───────────────────────────────────────────────
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

      // ── 7. Update conversation lastMessage ───────────────────────────────
      await this.conversationModel.findByIdAndUpdate(conversationObjectId, {
        lastMessage: message._id,
        lastMessageAt: sentAt,
        $inc: { unreadCount: 1 },
      });

      savedMessages.push(message);
    }

    return savedMessages;
  }

  async processInstagramWebhook(
    tenantId: string,
    payload: InstagramWebhookDto,
  ): Promise<MessageDocument[]> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const savedMessages: MessageDocument[] = [];

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
          customer = await this.customerModel.create({
            tenantId: tenantObjectId,
            name: senderId,
            instagramInfo: { accountId: senderId },
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
      }
    }

    return savedMessages;
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
}
