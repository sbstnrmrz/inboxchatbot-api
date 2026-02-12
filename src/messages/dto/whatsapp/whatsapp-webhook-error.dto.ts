import { IsNumber, IsString, IsOptional } from 'class-validator';

export class WhatsAppWebhookErrorDto {
  @IsNumber()
  code: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  details?: string;
}
