import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '../schemas/message.schema.js';
import { CreateMessageMediaDto } from './create-message.dto.js';

/**
 * DTO for messages sent manually by an agent from the UI.
 *
 * tenantId, sender (userId + SenderType.User), channel and direction
 * are resolved server-side from the Better Auth session and the
 * conversation document — they are never sent by the client.
 */
export class SendMessageDto {
  @IsMongoId()
  conversationId: string;

  @IsEnum(MessageType)
  messageType: MessageType;

  /** Required when messageType is TEXT */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  body?: string;

  /** Required when messageType is IMAGE, AUDIO, VIDEO, DOCUMENT, etc. */
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateMessageMediaDto)
  media?: CreateMessageMediaDto;
}
