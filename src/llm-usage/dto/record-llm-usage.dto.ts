import { IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ConversationChannel } from '../../conversations/schemas/conversation.schema.js';

export class TokenUsageDto {
  @IsInt()
  @Min(0)
  input: number;

  @IsInt()
  @Min(0)
  output: number;
}

export class RecordLlmUsageDto {
  @IsString()
  tenantId: string;

  @Transform(({ value }) => (value as string)?.toUpperCase())
  @IsEnum(ConversationChannel)
  channel: ConversationChannel;

  @IsOptional()
  @ValidateNested()
  @Type(() => TokenUsageDto)
  openaiTokens?: TokenUsageDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TokenUsageDto)
  geminiTokens?: TokenUsageDto;
}
