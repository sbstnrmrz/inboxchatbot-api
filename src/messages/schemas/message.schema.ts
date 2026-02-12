import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum MessageChannel {
  WhatsApp = 'WHATSAPP',
  Instagram = 'INSTAGRAM',
}

export enum MessageDirection {
  Inbound = 'INBOUND',
  Outbound = 'OUTBOUND',
}

export enum MessageStatus {
  Sent = 'SENT',
  Delivered = 'DELIVERED',
  Read = 'READ',
  Failed = 'FAILED',
}

/**
 * Unified message types across WhatsApp and Instagram.
 *
 * WhatsApp:  text | image | audio | video | document | sticker |
 *            location | contacts | interactive | button | reaction |
 *            order | system | unknown
 * Instagram: text | image | audio | video | file | reel | share |
 *            sticker | postback
 */
export enum MessageType {
  Text = 'TEXT',
  Image = 'IMAGE',
  Audio = 'AUDIO',
  Video = 'VIDEO',
  Document = 'DOCUMENT',
  Sticker = 'STICKER',
  Location = 'LOCATION',
  Contacts = 'CONTACTS',
  Interactive = 'INTERACTIVE',
  Button = 'BUTTON',
  Reaction = 'REACTION',
  Order = 'ORDER',
  Reel = 'REEL',
  Share = 'SHARE',
  Postback = 'POSTBACK',
  System = 'SYSTEM',
  Unknown = 'UNKNOWN',
}

// ─── Sender ──────────────────────────────────────────────────────────────────

export enum SenderType {
  Customer = 'CUSTOMER',
  User = 'USER',
  Bot = 'BOT',
}

export interface MessageSender {
  type: SenderType;
  /**
   * ObjectId when type is CUSTOMER or USER.
   * Undefined when type is BOT (no specific user reference needed).
   */
  id?: Types.ObjectId;
}

// ─── Media ───────────────────────────────────────────────────────────────────

/**
 * Unified media object.
 *
 * WhatsApp provides:  id (media ID), mime_type, sha256, caption, filename
 * Instagram provides: url, title
 *
 * Both fields are optional so the same interface works for either channel.
 */
export interface MessageMedia {
  /** WhatsApp media ID (used to retrieve the media from the WA Cloud API) */
  whatsappMediaId?: string;
  /** Direct URL — always present for Instagram, may be resolved for WhatsApp */
  url?: string;
  mimeType?: string;
  /** SHA-256 checksum (WhatsApp only) */
  sha256?: string;
  /** Caption provided by the sender */
  caption?: string;
  /** Original filename — documents only (WhatsApp) */
  filename?: string;
  /** Approximate file size in bytes, if known */
  size?: number;
}

// ─── Referral ─────────────────────────────────────────────────────────────────

/**
 * Normalized referral object — present when the message originated from an ad
 * or external link that redirected the user to the conversation.
 *
 * WhatsApp: Click to WhatsApp ads
 *   source_url, source_type (ad|post), source_id, headline, body,
 *   media_type (image|video), image_url?, video_url?, thumbnail_url?
 *
 * Instagram: Click-to-Instagram Direct ads or ig.me/ links
 *   ref, source, type (OPEN_THREAD)
 */
export interface MessageReferral {
  /**
   * URL that leads to the ad or post clicked by the user.
   * WhatsApp: source_url  |  Instagram: source
   */
  sourceUrl?: string;
  /**
   * Type of the ad source.
   * WhatsApp: "ad" | "post"  |  Instagram: "OPEN_THREAD" (type field)
   */
  sourceType?: string;
  /** Meta ID for the ad or post (WhatsApp only) */
  sourceId?: string;
  /** Ad headline (WhatsApp only) */
  headline?: string;
  /** Ad body / description (WhatsApp only) */
  body?: string;
  /**
   * Developer-defined ref parameter from the ig.me/ link (Instagram only).
   * Equivalent to a UTM parameter for Instagram entry points.
   */
  ref?: string;
  /** Media type present in the ad: "image" | "video" (WhatsApp only) */
  mediaType?: string;
  /** URL to the ad image (WhatsApp only, when mediaType is "image") */
  imageUrl?: string;
  /** URL to the ad video (WhatsApp only, when mediaType is "video") */
  videoUrl?: string;
  /** URL to the video thumbnail (WhatsApp only, when mediaType is "video") */
  thumbnailUrl?: string;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Conversation' })
  conversationId: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(MessageChannel),
  })
  channel: MessageChannel;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(MessageDirection),
  })
  direction: MessageDirection;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(MessageType),
  })
  messageType: MessageType;

  @Prop({
    required: true,
    type: {
      type: { type: String, enum: Object.values(SenderType), required: true },
      id: { type: Types.ObjectId, required: false },
    },
    _id: false,
  })
  sender: MessageSender;

  /** Plain text content — present when messageType is TEXT */
  @Prop({ type: String })
  body?: string;

  /** Media metadata — present for IMAGE, AUDIO, VIDEO, DOCUMENT, STICKER, REEL, SHARE */
  @Prop({ type: Object })
  media?: MessageMedia;

  /**
   * Channel-native message ID.
   * WhatsApp: wamid.xxx  |  Instagram: mid.xxx
   * Stored for idempotency and status updates.
   */
  @Prop({ type: String, index: true })
  externalId?: string;

  @Prop({
    type: String,
    enum: Object.values(MessageStatus),
    default: MessageStatus.Sent,
  })
  status: MessageStatus;

  /** When the message was originally sent (from the channel timestamp, not our server) */
  @Prop({ required: true, type: Date })
  sentAt: Date;

  /** When the channel confirmed delivery to the recipient's device */
  @Prop({ type: Date })
  deliveredAt?: Date;

  /** When the recipient read the message */
  @Prop({ type: Date })
  readAt?: Date;

  /**
   * Referral metadata — present when the conversation was initiated from an ad
   * or external link (Click to WhatsApp / Click-to-Instagram Direct / ig.me/).
   */
  @Prop({ type: Object })
  referral?: MessageReferral;

  createdAt?: Date;
  updatedAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ tenantId: 1, conversationId: 1, sentAt: -1 });
MessageSchema.index({ tenantId: 1, externalId: 1 }, { sparse: true });
