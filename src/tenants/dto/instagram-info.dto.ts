import { IsBoolean, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class InstagramInfoDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsNotEmpty()
  pageId: string;

  @IsString()
  @IsNotEmpty()
  appSecret: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
