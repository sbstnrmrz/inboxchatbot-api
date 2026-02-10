import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { encrypt, decrypt, isEncrypted } from '../../utils/encryption.js';

export type TenantDocument = Tenant & Document;

// WhatsApp integration configuration
export interface WhatsAppInfo {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookVerifyToken?: string;
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

// Fields that must be encrypted at rest
const WHATSAPP_ENCRYPTED_FIELDS: (keyof WhatsAppInfo)[] = [
  'accessToken',
  'appSecret',
  'webhookVerifyToken',
];

const INSTAGRAM_ENCRYPTED_FIELDS: (keyof InstagramInfo)[] = [
  'accessToken',
  'appSecret',
];

function encryptWhatsAppInfo(info: WhatsAppInfo): void {
  const record = info as unknown as Record<string, unknown>;
  for (const field of WHATSAPP_ENCRYPTED_FIELDS) {
    const value = record[field];
    if (typeof value === 'string' && !isEncrypted(value)) {
      record[field] = encrypt(value);
    }
  }
}

function decryptWhatsAppInfo(info: WhatsAppInfo): void {
  const record = info as unknown as Record<string, unknown>;
  for (const field of WHATSAPP_ENCRYPTED_FIELDS) {
    const value = record[field];
    if (typeof value === 'string' && isEncrypted(value)) {
      record[field] = decrypt(value);
    }
  }
}

function encryptInstagramInfo(info: InstagramInfo): void {
  const record = info as unknown as Record<string, unknown>;
  for (const field of INSTAGRAM_ENCRYPTED_FIELDS) {
    const value = record[field];
    if (typeof value === 'string' && !isEncrypted(value)) {
      record[field] = encrypt(value);
    }
  }
}

function decryptInstagramInfo(info: InstagramInfo): void {
  const record = info as unknown as Record<string, unknown>;
  for (const field of INSTAGRAM_ENCRYPTED_FIELDS) {
    const value = record[field];
    if (typeof value === 'string' && isEncrypted(value)) {
      record[field] = decrypt(value);
    }
  }
}

@Schema({ timestamps: true })
export class Tenant {
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  slug: string;

  @Prop({ type: String, required: true, trim: true })
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
TenantSchema.index({ createdAt: -1 });

// Pre-save: ensure slug is URL-friendly
TenantSchema.pre('save', function () {
  if (this.isModified('slug')) {
    this.slug = this.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }
});

TenantSchema.pre('save', function () {
  if (this.whatsappInfo) encryptWhatsAppInfo(this.whatsappInfo);
  if (this.instagramInfo) encryptInstagramInfo(this.instagramInfo);
});

TenantSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() as Record<string, unknown>;
  if (!update) return;

  const whatsapp = update['whatsappInfo'] as WhatsAppInfo | undefined;
  const instagram = update['instagramInfo'] as InstagramInfo | undefined;

  if (whatsapp) encryptWhatsAppInfo(whatsapp);
  if (instagram) encryptInstagramInfo(instagram);
});

TenantSchema.post('save', function (doc: TenantDocument) {
  if (doc.whatsappInfo) decryptWhatsAppInfo(doc.whatsappInfo);
  if (doc.instagramInfo) decryptInstagramInfo(doc.instagramInfo);
});

TenantSchema.post('findOne', function (doc: TenantDocument | null) {
  if (!doc) return;
  if (doc.whatsappInfo) decryptWhatsAppInfo(doc.whatsappInfo);
  if (doc.instagramInfo) decryptInstagramInfo(doc.instagramInfo);
});

TenantSchema.post('find', function (docs: TenantDocument[]) {
  for (const doc of docs) {
    if (doc.whatsappInfo) decryptWhatsAppInfo(doc.whatsappInfo);
    if (doc.instagramInfo) decryptInstagramInfo(doc.instagramInfo);
  }
});

TenantSchema.post('findOneAndUpdate', function (doc: TenantDocument | null) {
  if (!doc) return;
  if (doc.whatsappInfo) decryptWhatsAppInfo(doc.whatsappInfo);
  if (doc.instagramInfo) decryptInstagramInfo(doc.instagramInfo);
});
