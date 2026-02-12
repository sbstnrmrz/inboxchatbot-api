import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WhatsAppWebhookChangeDto } from './whatsapp-webhook-change.dto.js';

export class WhatsAppWebhookEntryDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppWebhookChangeDto)
  changes: WhatsAppWebhookChangeDto[];
}
