import {
  IsNumber,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InstagramWebhookSenderDto } from './instagram-webhook-sender.dto.js';
import { InstagramWebhookRecipientDto } from './instagram-webhook-recipient.dto.js';
import { InstagramWebhookMessageDto } from './instagram-webhook-message.dto.js';
import { InstagramWebhookPostbackDto } from './instagram-webhook-postback.dto.js';
import { InstagramWebhookReactionDto } from './instagram-webhook-reaction.dto.js';
import { InstagramWebhookReadDto } from './instagram-webhook-read.dto.js';
import { InstagramWebhookMessageEditDto } from './instagram-webhook-message-edit.dto.js';
import { InstagramWebhookReferralDto } from './instagram-webhook-referral.dto.js';

export class InstagramWebhookMessagingEventDto {
  @ValidateNested()
  @Type(() => InstagramWebhookSenderDto)
  sender: InstagramWebhookSenderDto;

  @ValidateNested()
  @Type(() => InstagramWebhookRecipientDto)
  recipient: InstagramWebhookRecipientDto;

  @IsNumber()
  timestamp: number;

  @IsBoolean()
  @IsOptional()
  is_self?: boolean;

  @ValidateNested()
  @Type(() => InstagramWebhookMessageDto)
  @IsOptional()
  message?: InstagramWebhookMessageDto;

  @ValidateNested()
  @Type(() => InstagramWebhookPostbackDto)
  @IsOptional()
  postback?: InstagramWebhookPostbackDto;

  @ValidateNested()
  @Type(() => InstagramWebhookReactionDto)
  @IsOptional()
  reaction?: InstagramWebhookReactionDto;

  @ValidateNested()
  @Type(() => InstagramWebhookReadDto)
  @IsOptional()
  read?: InstagramWebhookReadDto;

  @ValidateNested()
  @Type(() => InstagramWebhookMessageEditDto)
  @IsOptional()
  message_edit?: InstagramWebhookMessageEditDto;

  @ValidateNested()
  @Type(() => InstagramWebhookReferralDto)
  @IsOptional()
  referral?: InstagramWebhookReferralDto;
}
