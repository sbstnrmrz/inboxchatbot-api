import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { LlmUsageService, LlmUsageTotals } from './llm-usage.service.js';
import { RecordLlmUsageDto } from './dto/record-llm-usage.dto.js';
import { FindLlmUsageDto } from './dto/find-llm-usage.dto.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('llm-usage')
export class LlmUsageController {
  constructor(private readonly llmUsageService: LlmUsageService) {}

  /**
   * Records a single LLM call's token usage for the tenant.
   * Called by n8n (or any bot) after each LLM completion.
   *
   * POST /llm-usage
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AllowAnonymous()
  async record(@Body() dto: RecordLlmUsageDto): Promise<{ recorded: number }> {
    return this.llmUsageService.record(dto);
  }

  /**
   * Returns aggregated token usage totals for the tenant.
   * Optionally filtered by date, from, or to.
   *
   * GET /llm-usage/totals
   */
  @Get('totals')
  async totals(
    @Query() dto: FindLlmUsageDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<LlmUsageTotals> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }
    return this.llmUsageService.totals(req.tenantId, dto);
  }
}
