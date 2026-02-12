import { IsString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InstagramWebhookEntryDto } from './instagram-webhook-entry.dto.js';

export class InstagramWebhookDto {
  @IsString()
  @IsNotEmpty()
  object: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstagramWebhookEntryDto)
  entry: InstagramWebhookEntryDto[];
}
