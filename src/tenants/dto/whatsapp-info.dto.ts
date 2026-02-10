import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class WhatsAppInfoDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  phoneNumberId: string;

  @IsString()
  @IsNotEmpty()
  businessAccountId: string;

  @IsString()
  @IsOptional()
  webhookVerifyToken?: string;

  @IsString()
  @IsNotEmpty()
  appSecret: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
