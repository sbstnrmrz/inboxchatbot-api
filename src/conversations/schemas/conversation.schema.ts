import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

export enum ConversationChannel {
  WhatsApp = 'WHATSAPP',
  Instagram = 'INSTAGRAM',
}

export enum ConversationStatus {
  Open = 'OPEN',
  Pending = 'PENDING',
  Closed = 'CLOSED',
}

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Customer' })
  customerId: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ConversationChannel),
  })
  channel: ConversationChannel;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(ConversationStatus),
    default: ConversationStatus.Open,
  })
  status: ConversationStatus;

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  @Prop({ type: Number, default: 0, min: 0 })
  unreadCount: number;

  @Prop({ type: Boolean, default: false })
  requestingAgent: boolean;

  @Prop({ type: Boolean, default: true })
  botEnabled: boolean;

  @Prop({ type: Date })
  botDisabledAt?: Date;

  @Prop({ type: Date })
  readAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ tenantId: 1, lastMessageAt: -1 });
ConversationSchema.index({ tenantId: 1, customerId: 1 });
ConversationSchema.index({ tenantId: 1, status: 1, lastMessageAt: -1 });
ConversationSchema.index({ tenantId: 1, channel: 1, lastMessageAt: -1 });
