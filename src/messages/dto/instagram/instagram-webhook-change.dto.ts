import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InstagramWebhookCommentValueDto } from './instagram-webhook-comment-value.dto.js';

export class InstagramWebhookChangeDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @ValidateNested()
  @Type(() => InstagramWebhookCommentValueDto)
  @IsOptional()
  value?: InstagramWebhookCommentValueDto;
}
