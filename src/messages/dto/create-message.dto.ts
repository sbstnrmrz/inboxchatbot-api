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
}
