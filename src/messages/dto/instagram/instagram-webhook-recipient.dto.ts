import { IsString, IsNotEmpty } from 'class-validator';

export class InstagramWebhookRecipientDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
