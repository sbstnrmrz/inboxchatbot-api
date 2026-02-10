import {
  IsString,
  IsNotEmpty,
  Matches,
  MaxLength,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WhatsAppInfoDto } from './whatsapp-info.dto';
import { InstagramInfoDto } from './instagram-info.dto';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(63)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug may only contain lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => WhatsAppInfoDto)
  whatsappInfo?: WhatsAppInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InstagramInfoDto)
  instagramInfo?: InstagramInfoDto;
}
