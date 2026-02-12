import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class InstagramWebhookReferralDto {
  @IsString()
  @IsNotEmpty()
  ref: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  type?: string;
}
