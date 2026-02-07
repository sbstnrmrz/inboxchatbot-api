import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

// WhatsApp integration configuration
export interface WhatsAppInfo {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken: string;
  appSecret: string;
  isActive?: boolean;
  lastSyncedAt?: Date;
}

// Instagram integration configuration
export interface InstagramInfo {
  accessToken: string;
  accountId: string;
  pageId: string;
  appSecret: string;
  isActive?: boolean;
  lastSyncedAt?: Date;
}

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Object, select: false })
  whatsappInfo?: WhatsAppInfo;

  @Prop({ type: Object, select: false })
  instagramInfo?: InstagramInfo;

  // Timestamps (auto-managed by mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Indexes
TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure slug is URL-friendly
TenantSchema.pre('save', function () {
  if (this.isModified('slug')) {
    this.slug = this.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
});
