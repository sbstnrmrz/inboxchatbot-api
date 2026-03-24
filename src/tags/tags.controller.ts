import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { TagsService } from './tags.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';
import { TagDocument } from './schemas/tag.schema.js';
import { ChatGateway } from '../chat/chat.gateway.js';
import { TagEvent } from '../chat/enums/tag-events.enum.js';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly chatGateway: ChatGateway,
  ) {}

  /**
   * GET /tags
   */
  @Get()
  async findAll(
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<TagDocument[]> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.tagsService.findAll(req.tenantId);
  }

  /**
   * POST /tags
   */
  @Post()
  async create(
    @Body() dto: CreateTagDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<TagDocument> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    const tag = await this.tagsService.create(req.tenantId, dto);
    this.chatGateway.emitToTenant(req.tenantId, TagEvent.Created, tag);
    return tag;
  }

  /**
   * PATCH /tags/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<TagDocument> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    const tag = await this.tagsService.update(req.tenantId, id, dto);
    this.chatGateway.emitToTenant(req.tenantId, TagEvent.Updated, tag);
    return tag;
  }

  /**
   * DELETE /tags/:id
   */
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<{ tagId: string }> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    const payload = await this.tagsService.remove(req.tenantId, id);
    this.chatGateway.emitToTenant(req.tenantId, TagEvent.Deleted, payload);
    return payload;
  }
}
