import {
  IsISO8601,
  IsInt,
  IsMongoId,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for the GET /messages endpoint.
 *
 * Implements cursor-based (keyset) pagination using `sentAt` as the cursor:
 *   - First page: omit `before`
 *   - Next pages : pass `before` = sentAt of the oldest message in the current page
 *
 * Results are always sorted newest-first (sentAt DESC).
 */
export class FindMessagesDto {
  /** Conversation to load messages for. */
  @IsMongoId()
  conversationId: string;

  /**
   * ISO-8601 timestamp cursor.
   * Only messages with sentAt < before are returned.
   * Omit to start from the most recent message.
   */
  @IsOptional()
  @IsISO8601()
  before?: string;

  /** Maximum number of messages to return. Defaults to 20, max 100. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
