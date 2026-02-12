import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InstagramWebhookCommentFromDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  self_ig_scoped_id?: string;
}

export class InstagramWebhookCommentMediaDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  media_product_type?: string;
}

export class InstagramWebhookCommentValueDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @ValidateNested()
  @Type(() => InstagramWebhookCommentFromDto)
  @IsOptional()
  from?: InstagramWebhookCommentFromDto;

  @IsString()
  @IsOptional()
  text?: string;

  @ValidateNested()
  @Type(() => InstagramWebhookCommentMediaDto)
  @IsOptional()
  media?: InstagramWebhookCommentMediaDto;
}
