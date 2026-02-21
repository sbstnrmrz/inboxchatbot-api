import {
  IsDefined,
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
import { InstagramSendMessageResponseDto } from './instagram/instagram-send-message-response.dto.js';

/**
 * Meta API response shape for a WhatsApp outbound message.
 *
 * Example:
 * {
 *   "messaging_product": "whatsapp",
 *   "contacts": [{ "input": "584147083834", "wa_id": "584147083834" }],
 *   "messages": [{ "id": "wamid.HBgM..." }]
 * }
 */
export class WhatsAppMetaResponseDto {
  @IsString()
  @IsNotEmpty()
  messaging_product: string;

  contacts: WhatsAppSendMessageResponseContactDto[];

  messages: WhatsAppSendMessageResponseMessageDto[];
}

/**
 * Union of possible Meta API response shapes.
 *
 * Both channels return a plain object — discriminate at runtime with
 * `isInstagramMetaResponse()`:
 *
 *   WhatsApp  → { messaging_product, contacts, messages }
 *   Instagram → { recipient_id, message_id }
 */
export type MetaResponse =
  | WhatsAppMetaResponseDto
  | InstagramSendMessageResponseDto;

/**
 * Type guard — returns true when the metaResponse came from Instagram.
 *
 * Usage in service:
 *   if (isInstagramMetaResponse(dto.metaResponse)) {
 *     // InstagramSendMessageResponseDto
 *     const externalId = dto.metaResponse.message_id;
 *   } else {
 *     // WhatsAppMetaResponseDto
 *     const externalId = dto.metaResponse.messages[0].id;
 *   }
 */
export function isInstagramMetaResponse(
  response: MetaResponse,
): response is InstagramSendMessageResponseDto {
  return (
    response != null &&
    typeof response === 'object' &&
    'recipient_id' in response
  );
}

/**
 * Payload sent by the bot to register an outbound message it already delivered
 * via the Meta API.
 *
 * - tenantId       → slug or MongoDB ObjectId — resolved to a canonical ID
 * - content        → text body of the message (optional for media-only messages)
 * - messageType    → one of the internal MessageType enum values
 * - metaResponse   → verbatim response returned by Meta — auto-detected:
 *                    WhatsApp → { messaging_product, contacts, messages }  (recipientId = contacts[0].wa_id)
 *                    Instagram → { recipient_id, message_id }              (recipientId = recipient_id)
 * - media          → present when messageType is IMAGE, AUDIO, VIDEO, DOCUMENT, etc.
 */
export class BotResponseDto {
  /** Tenant identifier — accepts either the MongoDB ObjectId or the slug */
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  /** Plain-text content of the message */
  @IsOptional()
  @IsString()
  content?: string;

  /** Internal message type — defaults to TEXT when omitted */
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  /**
   * Verbatim response returned by the Meta API.
   * Accepted as-is — use `isInstagramMetaResponse()` to discriminate the channel.
   */
  @IsDefined()
  @IsObject()
  metaResponse: MetaResponse;

  /** Media metadata — required when messageType is not TEXT */
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMessageMediaDto)
  media?: CreateMessageMediaDto;
}
