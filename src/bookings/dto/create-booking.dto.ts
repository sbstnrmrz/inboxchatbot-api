import { IsEmail, IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../schemas/booking.schema.js';

export class CreateBookingDto {
  @IsString()
  tenantId: string;

  @IsString()
  customerId: string;

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}
