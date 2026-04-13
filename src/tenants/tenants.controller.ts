import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { Request as ExpressRequest } from 'express';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { ChatGateway } from '../chat/chat.gateway.js';
import { TenantEvent } from '../chat/enums/tenant-events.enum.js';

@Controller('tenants')
export class TenantsController {
  constructor(
    private readonly tenantsService: TenantsService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantsService.create(createTenantDto);
  }

  @Post('toggle-bot')
  async toggleBot(@Request() req: ExpressRequest & { tenantId?: string }) {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }
    const result = await this.tenantsService.toggleBot(req.tenantId);
    this.chatGateway.emitToTenant(req.tenantId, TenantEvent.BotToggled, result);
    return result;
  }

  @AllowAnonymous()
  @Get('bot-status')
  async getBotStatus(@Request() req: ExpressRequest & { tenantId?: string }) {
    const headerValue = req.headers['tenant-id'] as string | undefined;
    const tenantId = headerValue
      ? await this.tenantsService.resolveId(headerValue)
      : req.tenantId;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }
    return this.tenantsService.getBotStatus(tenantId);
  }

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantsService.update(id, updateTenantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantsService.remove(id);
  }
}
