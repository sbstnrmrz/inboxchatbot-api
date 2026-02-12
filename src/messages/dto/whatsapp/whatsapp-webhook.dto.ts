import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WhatsAppWebhookEntryDto } from './whatsapp-webhook-entry.dto.js';

export class WhatsAppWebhookDto {
  @IsString()
  @IsNotEmpty()
  object: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppWebhookEntryDto)
  entry: WhatsAppWebhookEntryDto[];
}
