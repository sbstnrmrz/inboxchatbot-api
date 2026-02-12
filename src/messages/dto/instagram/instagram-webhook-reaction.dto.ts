import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class InstagramWebhookReactionDto {
  @IsString()
  @IsNotEmpty()
  mid: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsOptional()
  reaction?: string;

  @IsString()
  @IsOptional()
  emoji?: string;
}
