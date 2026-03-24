import { IsHexColor, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;
}
