import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

export interface CustomerWhatsAppInfo {
  id: string;
  name: string;
}

export interface CustomerInstagramInfo {
  accountId: string;
  name?: string;
  username?: string;
}

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: Object })
  whatsappInfo?: CustomerWhatsAppInfo;

  @Prop({ type: Object })
  instagramInfo?: CustomerInstagramInfo;

  @Prop({ type: Boolean, default: false })
  isBlocked: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.index(
  { tenantId: 1, 'whatsappInfo.id': 1 },
  { unique: true, sparse: true },
);
CustomerSchema.index(
  { tenantId: 1, 'instagramInfo.accountId': 1 },
  { unique: true, sparse: true },
);
