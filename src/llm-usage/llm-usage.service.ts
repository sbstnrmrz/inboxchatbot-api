import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LlmUsage, LlmUsageDocument } from './schemas/llm-usage.schema.js';
import { RecordLlmUsageDto } from './dto/record-llm-usage.dto.js';
import { FindLlmUsageDto } from './dto/find-llm-usage.dto.js';
import { TenantsService } from '../tenants/tenants.service.js';

export interface ModelChannelTotals {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  calls: number;
}

export type LlmUsageTotals = Record<string, Record<string, ModelChannelTotals>>;

@Injectable()
export class LlmUsageService {
  constructor(
    @InjectModel(LlmUsage.name)
    private readonly llmUsageModel: Model<LlmUsageDocument>,
    private readonly tenantsService: TenantsService,
  ) {}

  async record(dto: RecordLlmUsageDto): Promise<{ recorded: number }> {
    const resolvedTenantId = await this.tenantsService.resolveId(dto.tenantId);
    const tenantObjectId = new Types.ObjectId(resolvedTenantId);

    const entries: { llmModel: string; inputTokens: number; outputTokens: number }[] = [];

    if (dto.openaiTokens && (dto.openaiTokens.input > 0 || dto.openaiTokens.output > 0)) {
      entries.push({ llmModel: 'openai', inputTokens: dto.openaiTokens.input, outputTokens: dto.openaiTokens.output });
    }
    if (dto.geminiTokens && (dto.geminiTokens.input > 0 || dto.geminiTokens.output > 0)) {
      entries.push({ llmModel: 'gemini', inputTokens: dto.geminiTokens.input, outputTokens: dto.geminiTokens.output });
    }

    await this.llmUsageModel.insertMany(
      entries.map((e) => ({ tenantId: tenantObjectId, channel: dto.channel, ...e })),
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

    const rows = await this.llmUsageModel.aggregate<{
      llmModel: string;
      channel: string;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      calls: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: { llmModel: '$llmModel', channel: '$channel' },
          inputTokens: { $sum: '$inputTokens' },
          outputTokens: { $sum: '$outputTokens' },
          totalTokens: { $sum: { $add: ['$inputTokens', '$outputTokens'] } },
          calls: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          llmModel: '$_id.llmModel',
          channel: '$_id.channel',
          inputTokens: 1,
          outputTokens: 1,
          totalTokens: 1,
          calls: 1,
        },
      },
    ]);

    const totals: LlmUsageTotals = {};
    for (const row of rows) {
      if (!totals[row.llmModel]) totals[row.llmModel] = {};
      totals[row.llmModel][row.channel.toLowerCase()] = {
        inputTokens: row.inputTokens,
        outputTokens: row.outputTokens,
        totalTokens: row.totalTokens,
        calls: row.calls,
      };
    }

    return totals;
  }
}
