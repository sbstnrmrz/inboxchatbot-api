import { IsString, IsNotEmpty } from 'class-validator';

export class WhatsAppWebhookTextDto {
  @IsString()
  @IsNotEmpty()
  body: string;
}
