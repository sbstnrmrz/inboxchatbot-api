import { IsString, IsNotEmpty } from 'class-validator';

export class InstagramWebhookSenderDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
