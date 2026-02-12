import { IsString, IsOptional } from 'class-validator';

export class WhatsAppWebhookProfileDto {
  @IsString()
  @IsOptional()
  name?: string;
}
