import { IsISO8601, IsOptional } from 'class-validator';

export class CountBookingsDto {
  @IsOptional()
  @IsISO8601()
  date?: string;

  @IsOptional()
  @IsISO8601()
  from?: string;

  @IsOptional()
  @IsISO8601()
  to?: string;
}
