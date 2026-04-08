import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ConversationChannel } from '../../conversations/schemas/conversation.schema.js';

export type LlmUsageDocument = LlmUsage & Document;

@Schema({ timestamps: true })
export class LlmUsage {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, enum: Object.values(ConversationChannel) })
  channel: ConversationChannel;

  @Prop({ required: true, type: String, trim: true })
  llmModel: string;

  @Prop({ required: true, type: Number })
  inputTokens: number;

  @Prop({ required: true, type: Number })
  outputTokens: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const LlmUsageSchema = SchemaFactory.createForClass(LlmUsage);

LlmUsageSchema.index({ tenantId: 1, createdAt: -1 });
