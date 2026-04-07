import { IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TokenUsageDto {
  @IsInt()
  @Min(0)
  input: number;

  @IsInt()
  @Min(0)
  output: number;
}

export class RecordLlmUsageDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => TokenUsageDto)
  openaiTokens?: TokenUsageDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TokenUsageDto)
  geminiTokens?: TokenUsageDto;
}
