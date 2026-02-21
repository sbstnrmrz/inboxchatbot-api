import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for GET /customers.
 *
 * Cursor-based pagination on `createdAt` (newest-first):
 *   - First page : omit `before`
 *   - Next pages : pass `before` = createdAt of the last customer in the current page
 *
 * Optional filter: ?search=<name substring>
 */
export class FindCustomersDto {
  /**
   * ISO-8601 timestamp cursor.
   * Only customers with createdAt < before are returned.
   */
  @IsOptional()
  @IsISO8601()
  before?: string;

  /** Maximum number of customers to return. Defaults to 20, max 100. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  /** Case-insensitive substring match on customer name. */
  @IsOptional()
  @IsString()
  search?: string;
}
