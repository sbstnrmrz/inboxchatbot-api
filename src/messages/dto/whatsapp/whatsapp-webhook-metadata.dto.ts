import { IsString, IsNotEmpty } from 'class-validator';

export class WhatsAppWebhookMetadataDto {
  @IsString()
  @IsNotEmpty()
  display_phone_number: string;

  @IsString()
  @IsNotEmpty()
  phone_number_id: string;
}
