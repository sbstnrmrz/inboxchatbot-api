import {
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ConversationStatus } from '../schemas/conversation.schema.js';

/**
 * Query parameters for GET /conversations.
 *
 * Cursor-based pagination on `lastMessageAt` (newest-first):
 *   - First page: omit `before`
 *   - Next pages : pass `before` = lastMessageAt of the last conversation in the current page
 */
export class FindConversationsDto {
  /** Filter by conversation status. Omit to return all statuses. */
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;

  /**
   * ISO-8601 timestamp cursor.
   * Only conversations with lastMessageAt < before are returned.
   */
  @IsOptional()
  @IsISO8601()
  before?: string;

  /** Maximum number of conversations to return. Defaults to 20, max 100. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
