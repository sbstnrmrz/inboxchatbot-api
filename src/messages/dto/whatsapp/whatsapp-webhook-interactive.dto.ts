import {
  IsString,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WhatsAppWebhookButtonReplyDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}

export class WhatsAppWebhookListReplyDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class WhatsAppWebhookInteractiveDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @ValidateNested()
  @Type(() => WhatsAppWebhookButtonReplyDto)
  @IsOptional()
  button_reply?: WhatsAppWebhookButtonReplyDto;

  @ValidateNested()
  @Type(() => WhatsAppWebhookListReplyDto)
  @IsOptional()
  list_reply?: WhatsAppWebhookListReplyDto;
}
