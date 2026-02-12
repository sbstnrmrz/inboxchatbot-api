import { IsString, IsNotEmpty } from 'class-validator';

export class InstagramWebhookMessageEditDto {
  @IsString()
  @IsNotEmpty()
  mid: string;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  num_edit: string;
}
