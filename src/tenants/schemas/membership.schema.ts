import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MembershipDocument = Membership & Document;

export enum MembershipStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DISABLED = 'disabled',
}

@Schema({ timestamps: true })
export class Membership {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(MembershipStatus),
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  @Prop()
  reason?: string;

  @Prop()
  statusChangedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  statusChangedBy?: Types.ObjectId;

  @Prop()
  suspendedAt?: Date;

  @Prop()
  disabledAt?: Date;

  @Prop()
  reactivatedAt?: Date;

  // Timestamps (auto-managed by mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

// Indexes for multitenancy and queries
MembershipSchema.index({ tenantId: 1 }, { unique: true });
MembershipSchema.index({ status: 1 });
MembershipSchema.index({ tenantId: 1, status: 1 });

// Pre-save middleware to track status changes
MembershipSchema.pre('save', function (this: MembershipDocument, next) {
  if (this.isModified('status')) {
    this.statusChangedAt = new Date();

    if (this.status === MembershipStatus.SUSPENDED) {
      this.suspendedAt = new Date();
    } else if (this.status === MembershipStatus.DISABLED) {
      this.disabledAt = new Date();
    } else if (
      this.status === MembershipStatus.ACTIVE &&
      this.isModified('status')
    ) {
      this.reactivatedAt = new Date();
    }
  }
  next();
});
