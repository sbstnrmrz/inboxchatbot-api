import { IsEnum, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
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
