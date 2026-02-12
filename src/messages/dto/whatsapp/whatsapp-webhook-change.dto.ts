import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WhatsAppWebhookValueDto } from './whatsapp-webhook-value.dto.js';

export class WhatsAppWebhookChangeDto {
  @ValidateNested()
  @Type(() => WhatsAppWebhookValueDto)
  value: WhatsAppWebhookValueDto;

  @IsString()
  @IsNotEmpty()
  field: string;
}
