import { IsBoolean, IsNumber, IsString, IsOptional } from 'class-validator';

export class WhatsAppWebhookIdentityDto {
  @IsBoolean()
  @IsOptional()
  acknowledged?: boolean;

  @IsNumber()
  @IsOptional()
  created_timestamp?: number;

  @IsString()
  @IsOptional()
  hash?: string;
}
