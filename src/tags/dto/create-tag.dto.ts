import { IsHexColor, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsHexColor()
  @IsOptional()
  color?: string;
}
