import { IsString, IsNotEmpty } from 'class-validator';

export class WhatsAppWebhookButtonDto {
  @IsString()
  @IsNotEmpty()
  payload: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
