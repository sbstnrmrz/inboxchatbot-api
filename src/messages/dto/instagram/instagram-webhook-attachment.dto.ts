import {
  IsString,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InstagramWebhookAttachmentPayloadDto {
  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  title?: string;
}

export class InstagramWebhookAttachmentDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @ValidateNested()
  @Type(() => InstagramWebhookAttachmentPayloadDto)
  @IsOptional()
  payload?: InstagramWebhookAttachmentPayloadDto;
}
