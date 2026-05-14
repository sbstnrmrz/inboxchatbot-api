import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  Pending = 'PENDING',
  Completed = 'COMPLETED',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Tenant', index: true })
  tenantId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Customer' })
  customerId: Types.ObjectId;

  @Prop({ required: true, type: Date })
  startDate: Date;

  @Prop({ required: true, type: Date })
  endDate: Date;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(BookingStatus),
    default: BookingStatus.Pending,
  })
  status: BookingStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ tenantId: 1, startDate: -1 });
BookingSchema.index({ tenantId: 1, customerId: 1 });
BookingSchema.index({ tenantId: 1, status: 1, startDate: -1 });
