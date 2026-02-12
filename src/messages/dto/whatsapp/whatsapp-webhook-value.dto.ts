import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WhatsAppWebhookMetadataDto } from './whatsapp-webhook-metadata.dto.js';
import { WhatsAppWebhookContactDto } from './whatsapp-webhook-contact.dto.js';
import { WhatsAppWebhookMessageDto } from './whatsapp-webhook-message.dto.js';
import { WhatsAppWebhookStatusDto } from './whatsapp-webhook-status.dto.js';
import { WhatsAppWebhookErrorDto } from './whatsapp-webhook-error.dto.js';

export class WhatsAppWebhookValueDto {
  @IsString()
  @IsNotEmpty()
  messaging_product: string;

  @ValidateNested()
  @Type(() => WhatsAppWebhookMetadataDto)
  metadata: WhatsAppWebhookMetadataDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppWebhookContactDto)
  @IsOptional()
  contacts?: WhatsAppWebhookContactDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppWebhookMessageDto)
  @IsOptional()
  messages?: WhatsAppWebhookMessageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppWebhookStatusDto)
  @IsOptional()
  statuses?: WhatsAppWebhookStatusDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppWebhookErrorDto)
  @IsOptional()
  errors?: WhatsAppWebhookErrorDto[];
}
