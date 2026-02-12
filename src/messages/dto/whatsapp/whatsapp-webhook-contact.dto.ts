import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WhatsAppWebhookProfileDto } from './whatsapp-webhook-profile.dto.js';

export class WhatsAppWebhookContactDto {
  @ValidateNested()
  @Type(() => WhatsAppWebhookProfileDto)
  profile: WhatsAppWebhookProfileDto;

  @IsString()
  @IsNotEmpty()
  wa_id: string;
}
