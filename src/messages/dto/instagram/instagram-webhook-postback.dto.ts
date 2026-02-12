import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class InstagramWebhookPostbackDto {
  @IsString()
  @IsNotEmpty()
  mid: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  payload?: string;

  @IsBoolean()
  @IsOptional()
  is_self?: boolean;
}
