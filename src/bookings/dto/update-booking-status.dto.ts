import { IsEnum } from 'class-validator';
import { BookingStatus } from '../schemas/booking.schema.js';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;
}
