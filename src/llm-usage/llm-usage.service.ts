import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LlmUsage, LlmUsageDocument } from './schemas/llm-usage.schema.js';
import { RecordLlmUsageDto } from './dto/record-llm-usage.dto.js';
import { FindLlmUsageDto } from './dto/find-llm-usage.dto.js';

export interface LlmUsageTotals {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  calls: number;
}

@Injectable()
export class LlmUsageService {
  constructor(
    @InjectModel(LlmUsage.name)
    private readonly llmUsageModel: Model<LlmUsageDocument>,
  ) {}

  async record(
    tenantId: string,
    dto: RecordLlmUsageDto,
  ): Promise<{ recorded: number }> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    const entries: { llmModel: string; inputTokens: number; outputTokens: number }[] = [];

    if (dto.openaiTokens) {
      entries.push({ llmModel: 'openai', inputTokens: dto.openaiTokens.input, outputTokens: dto.openaiTokens.output });
    }
    if (dto.geminiTokens) {
      entries.push({ llmModel: 'gemini', inputTokens: dto.geminiTokens.input, outputTokens: dto.geminiTokens.output });
    }

    await this.llmUsageModel.insertMany(
      entries.map((e) => ({ tenantId: tenantObjectId, ...e })),
    );

    return { recorded: entries.length };
  }

  async totals(tenantId: string, dto: FindLlmUsageDto = {}): Promise<LlmUsageTotals> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const match: Record<string, unknown> = { tenantId: tenantObjectId };

    if (dto.date) {
      const start = new Date(dto.date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(dto.date);
      end.setUTCHours(23, 59, 59, 999);
      match['createdAt'] = { $gte: start, $lte: end };
    } else if (dto.from || dto.to) {
      const range: Record<string, Date> = {};
      if (dto.from) range['$gte'] = new Date(dto.from);
      if (dto.to) {
        const end = new Date(dto.to);
        if (!/T\d{2}:\d{2}/.test(dto.to)) end.setUTCHours(23, 59, 59, 999);
        range['$lte'] = end;
      }
      match['createdAt'] = range;
    }

    const [result] = await this.llmUsageModel.aggregate<LlmUsageTotals>([
      { $match: match },
      {
        $group: {
          _id: null,
          inputTokens: { $sum: '$inputTokens' },
          outputTokens: { $sum: '$outputTokens' },
          totalTokens: { $sum: { $add: ['$inputTokens', '$outputTokens'] } },
          calls: { $sum: 1 },
        },
      },
      { $project: { _id: 0 } },
    ]);

    return result ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0, calls: 0 };
  }
}
