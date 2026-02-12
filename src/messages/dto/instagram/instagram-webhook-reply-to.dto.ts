import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class InstagramWebhookStoryDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  id?: string;
}

export class InstagramWebhookReplyToDto {
  @ValidateNested()
  @Type(() => InstagramWebhookStoryDto)
  @IsOptional()
  story?: InstagramWebhookStoryDto;

  @IsString()
  @IsOptional()
  mid?: string;
}
