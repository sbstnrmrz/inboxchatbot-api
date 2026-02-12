import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InstagramWebhookAttachmentDto } from './instagram-webhook-attachment.dto.js';
import { InstagramWebhookReplyToDto } from './instagram-webhook-reply-to.dto.js';

export class InstagramWebhookMessageDto {
  @IsString()
  @IsNotEmpty()
  mid: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsBoolean()
  @IsOptional()
  is_echo?: boolean;

  @IsBoolean()
  @IsOptional()
  is_self?: boolean;

  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;

  @IsBoolean()
  @IsOptional()
  is_unsupported?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstagramWebhookAttachmentDto)
  @IsOptional()
  attachments?: InstagramWebhookAttachmentDto[];

  @ValidateNested()
  @Type(() => InstagramWebhookReplyToDto)
  @IsOptional()
  reply_to?: InstagramWebhookReplyToDto;
}
