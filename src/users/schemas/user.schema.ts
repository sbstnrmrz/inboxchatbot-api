import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  SuperAdmin = 'superadmin',
  Admin = 'admin',
  User = 'user',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.User,
  })
  role: UserRole;

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1 });
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });
