import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InstagramWebhookMessagingEventDto } from './instagram-webhook-messaging-event.dto.js';
import { InstagramWebhookChangeDto } from './instagram-webhook-change.dto.js';

export class InstagramWebhookEntryDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  time?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstagramWebhookMessagingEventDto)
  @IsOptional()
  messaging?: InstagramWebhookMessagingEventDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstagramWebhookChangeDto)
  @IsOptional()
  changes?: InstagramWebhookChangeDto[];
}
