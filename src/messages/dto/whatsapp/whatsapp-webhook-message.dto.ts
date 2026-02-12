import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WhatsAppWebhookTextDto } from './whatsapp-webhook-text.dto.js';
import { WhatsAppWebhookMediaDto } from './whatsapp-webhook-media.dto.js';
import { WhatsAppWebhookReactionDto } from './whatsapp-webhook-reaction.dto.js';
import { WhatsAppWebhookContextDto } from './whatsapp-webhook-context.dto.js';
import { WhatsAppWebhookIdentityDto } from './whatsapp-webhook-identity.dto.js';
import { WhatsAppWebhookInteractiveDto } from './whatsapp-webhook-interactive.dto.js';
import { WhatsAppWebhookButtonDto } from './whatsapp-webhook-button.dto.js';
import { WhatsAppWebhookReferralDto } from './whatsapp-webhook-referral.dto.js';
import { WhatsAppWebhookSystemDto } from './whatsapp-webhook-system.dto.js';
import { WhatsAppWebhookErrorDto } from './whatsapp-webhook-error.dto.js';

export class WhatsAppWebhookMessageDto {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @ValidateNested()
  @Type(() => WhatsAppWebhookContextDto)
  @IsOptional()
  context?: WhatsAppWebhookContextDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookIdentityDto)
  @IsOptional()
  identity?: WhatsAppWebhookIdentityDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookTextDto)
  @IsOptional()
  text?: WhatsAppWebhookTextDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookMediaDto)
  @IsOptional()
  audio?: WhatsAppWebhookMediaDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookMediaDto)
  @IsOptional()
  image?: WhatsAppWebhookMediaDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookMediaDto)
  @IsOptional()
  sticker?: WhatsAppWebhookMediaDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookMediaDto)
  @IsOptional()
  video?: WhatsAppWebhookMediaDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookMediaDto)
  @IsOptional()
  document?: WhatsAppWebhookMediaDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookReactionDto)
  @IsOptional()
  reaction?: WhatsAppWebhookReactionDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookInteractiveDto)
  @IsOptional()
  interactive?: WhatsAppWebhookInteractiveDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookButtonDto)
  @IsOptional()
  button?: WhatsAppWebhookButtonDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookSystemDto)
  @IsOptional()
  system?: WhatsAppWebhookSystemDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookReferralDto)
  @IsOptional()
  referral?: WhatsAppWebhookReferralDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppWebhookErrorDto)
  @IsOptional()
  errors?: WhatsAppWebhookErrorDto[];
}
