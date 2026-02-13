import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../schemas/message.schema.js';
import { CreateMessageMediaDto } from './create-message.dto.js';
import {
  WhatsAppSendMessageResponseContactDto,
  WhatsAppSendMessageResponseMessageDto,
} from './whatsapp/whatsapp-send-message-response.dto.js';

/**
 * Shape of the Meta API response included in the bot-response payload.
 * Matches the WhatsApp Cloud API POST /{phone-number-id}/messages response.
 */
export class BotResponseMetaResponseDto {
  @IsString()
  @IsNotEmpty()
  messaging_product: string;

  contacts: WhatsAppSendMessageResponseContactDto[];

  messages: WhatsAppSendMessageResponseMessageDto[];
}

/**
 * Payload sent by the bot to register an outbound message it already delivered
 * via the Meta API.
 *
 * - phoneNumberId  → used to look up the tenant (via whatsappInfo.phoneNumberId)
 * - tenantId       → slug or MongoDB ObjectId — resolved to a canonical ID
 * - content        → text body of the message (optional for media-only messages)
 * - messageType    → one of the internal MessageType enum values
 * - metaResponse   → verbatim response returned by Meta when the message was sent
 * - media          → present when messageType is IMAGE, AUDIO, VIDEO, DOCUMENT, etc.
 */
export class BotResponseDto {
  /** WhatsApp phone number ID used by the bot to send the message */
  @IsString()
  @IsNotEmpty()
  phoneNumberId: string;

  /** Tenant identifier — accepts either the MongoDB ObjectId or the slug */
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  /** Plain-text content of the message */
  @IsOptional()
  @IsString()
  content?: string;

  /** Internal message type */
  @IsEnum(MessageType)
  messageType: MessageType;

  /** Verbatim response object returned by the Meta API */
  @IsObject()
  @ValidateNested()
  @Type(() => BotResponseMetaResponseDto)
  metaResponse: BotResponseMetaResponseDto;

  /** Media metadata — required when messageType is not TEXT */
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMessageMediaDto)
  media?: CreateMessageMediaDto;
}
