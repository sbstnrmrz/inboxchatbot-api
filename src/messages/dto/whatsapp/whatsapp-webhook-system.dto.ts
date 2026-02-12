import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class WhatsAppWebhookSystemDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  new_wa_id?: string;

  @IsString()
  @IsOptional()
  identity?: string;

  @IsString()
  @IsOptional()
  user?: string;
}
