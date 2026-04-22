import { IsEnum, IsISO8601, IsMongoId, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../schemas/booking.schema.js';

export class CreateBookingDto {
  @IsMongoId()
  tenantId: string;

  @IsString()
  customerId: string;

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
