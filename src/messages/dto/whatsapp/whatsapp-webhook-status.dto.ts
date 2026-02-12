import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WhatsAppWebhookErrorDto } from './whatsapp-webhook-error.dto.js';

export class WhatsAppWebhookOriginDto {
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class WhatsAppWebhookConversationDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @ValidateNested()
  @Type(() => WhatsAppWebhookOriginDto)
  @IsOptional()
  origin?: WhatsAppWebhookOriginDto;

  @IsString()
  @IsOptional()
  expiration_timestamp?: string;
}

export class WhatsAppWebhookPricingDto {
  @IsString()
  @IsNotEmpty()
  pricing_model: string;

  @IsOptional()
  billable?: boolean;

  @IsString()
  @IsOptional()
  category?: string;
}

export class WhatsAppWebhookStatusDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  recipient_id: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @ValidateNested()
  @Type(() => WhatsAppWebhookConversationDto)
  @IsOptional()
  conversation?: WhatsAppWebhookConversationDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookPricingDto)
  @IsOptional()
  pricing?: WhatsAppWebhookPricingDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppWebhookErrorDto)
  @IsOptional()
  errors?: WhatsAppWebhookErrorDto[];
}
