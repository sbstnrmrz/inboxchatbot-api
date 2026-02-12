import { IsString, IsNotEmpty } from 'class-validator';

export class WhatsAppWebhookReactionDto {
  @IsString()
  @IsNotEmpty()
  message_id: string;

  @IsString()
  @IsNotEmpty()
  emoji: string;
}
