import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  IsMongoId,
  ValidateNested,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MessageChannel,
  MessageDirection,
  MessageType,
  MessageStatus,
  SenderType,
} from '../schemas/message.schema.js';

export class CreateMessageReferralDto {
  /** URL of the ad or post — WhatsApp: source_url | Instagram: source */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sourceUrl?: string;

  /** Source type — WhatsApp: "ad" | "post" | Instagram: "OPEN_THREAD" */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sourceType?: string;

  /** Meta ID for the ad or post (WhatsApp only) */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sourceId?: string;

  /** Ad headline (WhatsApp only) */
  @IsOptional()
  @IsString()
  headline?: string;

  /** Ad body / description (WhatsApp only) */
  @IsOptional()
  @IsString()
  body?: string;

  /** ig.me/ ref parameter (Instagram only) */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ref?: string;

  /** Media type in the ad: "image" | "video" (WhatsApp only) */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mediaType?: string;

  /** URL to the ad image (WhatsApp only) */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  imageUrl?: string;

  /** URL to the ad video (WhatsApp only) */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  videoUrl?: string;

  /** URL to the video thumbnail (WhatsApp only) */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  thumbnailUrl?: string;
}

export class CreateMessageSenderDto {
  @IsEnum(SenderType)
  type: SenderType;

  /**
   * Required when type is CUSTOMER or USER.
   * Omit when type is BOT.
   */
  @IsOptional()
  @IsMongoId()
  id?: string;
}

export class CreateMessageMediaDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  whatsappMediaId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  url?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mimeType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sha256?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  filename?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  size?: number;
}

export class CreateMessageDto {
  @IsMongoId()
  tenantId: string;

  @IsMongoId()
  conversationId: string;

  @IsEnum(MessageChannel)
  channel: MessageChannel;

  @IsEnum(MessageDirection)
  direction: MessageDirection;

  @IsEnum(MessageType)
  messageType: MessageType;

  @ValidateNested()
  @Type(() => CreateMessageSenderDto)
  sender: CreateMessageSenderDto;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMessageMediaDto)
  media?: CreateMessageMediaDto;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  externalId?: string;

  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @IsDate()
  @Type(() => Date)
  sentAt: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deliveredAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  readAt?: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMessageReferralDto)
  referral?: CreateMessageReferralDto;
}
