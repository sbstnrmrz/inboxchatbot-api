import { IsEnum, IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../schemas/booking.schema.js';

export class FindBookingsDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsMongoId()
  customerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
