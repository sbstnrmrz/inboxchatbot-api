import { IsISO8601, IsOptional } from 'class-validator';

/**
 * Query parameters for GET /messages/count.
 *
 * - `date`  : filter messages sent on a specific calendar day (UTC).
 * - `from` / `to` : filter messages within an inclusive date range.
 *
 * `date` and `from`/`to` are mutually exclusive; `date` takes precedence
 * when both are provided.
 */
export class CountMessagesDto {
  /** Exact day filter – ISO-8601 date or datetime (e.g. "2024-03-15"). */
  @IsOptional()
  @IsISO8601()
  date?: string;

  /** Range start (inclusive) – ISO-8601 date or datetime. */
  @IsOptional()
  @IsISO8601()
  from?: string;

  /** Range end (inclusive, end of day when only a date is given) – ISO-8601 date or datetime. */
  @IsOptional()
  @IsISO8601()
  to?: string;
}
