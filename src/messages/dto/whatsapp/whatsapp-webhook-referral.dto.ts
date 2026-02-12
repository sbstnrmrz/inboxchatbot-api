import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WhatsAppWebhookReferralDto {
  @IsString()
  @IsNotEmpty()
  source_url: string;

  @IsString()
  @IsNotEmpty()
  source_type: string;

  @IsString()
  @IsNotEmpty()
  source_id: string;

  @IsString()
  @IsNotEmpty()
  headline: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  media_type: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  video_url?: string;

  @IsString()
  @IsOptional()
  thumbnail_url?: string;
}
