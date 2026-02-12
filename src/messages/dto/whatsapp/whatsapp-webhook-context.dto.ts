import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class WhatsAppWebhookContextDto {
  @IsBoolean()
  @IsOptional()
  forwarded?: boolean;

  @IsBoolean()
  @IsOptional()
  frequently_forwarded?: boolean;

  @IsString()
  @IsOptional()
  from?: string;

  @IsString()
  @IsOptional()
  id?: string;
}
