import { IsString, IsNotEmpty } from 'class-validator';

export class InstagramWebhookReadDto {
  @IsString()
  @IsNotEmpty()
  mid: string;
}
