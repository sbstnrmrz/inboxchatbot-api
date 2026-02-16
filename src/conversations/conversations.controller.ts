import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ConversationsService } from './conversations.service.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { UpdateConversationDto } from './dto/update-conversation.dto.js';
import { FindConversationsDto } from './dto/find-conversations.dto.js';
import { ConversationDocument } from './schemas/conversation.schema.js';
import { MessagesService } from '../messages/messages.service.js';
import { FindMessagesDto } from '../messages/dto/find-messages.dto.js';
import { MessageDocument } from '../messages/schemas/message.schema.js';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Post()
  create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.create(createConversationDto);
  }

  /**
   * Returns a paginated list of conversations for the current tenant,
   * ordered by lastMessageAt DESC.
   *
   * Cursor-based pagination on `lastMessageAt`:
   *   - First page : GET /conversations?limit=20
   *   - Next page  : GET /conversations?limit=20&before=<lastMessageAt of last conversation>
   *
   * Optional filter: ?status=OPEN | PENDING | CLOSED
   *
   * GET /conversations
   */
  @Get()
  async findAll(
    @Query() dto: FindConversationsDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<ConversationDocument[]> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.conversationsService.findAll(req.tenantId, dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(+id, updateConversationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationsService.remove(+id);
  }

  /**
   * Returns a paginated list of messages for a conversation.
   *
   * Cursor-based pagination on `sentAt` (newest-first):
   *   - First page : GET /conversations/:conversationId/messages?limit=20
   *   - Next page  : GET /conversations/:conversationId/messages?limit=20&before=<sentAt of oldest message>
   *
   * The tenant is resolved from the TenantsMiddleware-injected `req.tenantId`.
   *
   * GET /conversations/:conversationId/messages
   */
  @Get(':conversationId/messages')
  async findMessages(
    @Param('conversationId') conversationId: string,
    @Query() query: Omit<FindMessagesDto, 'conversationId'>,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<MessageDocument[]> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.messagesService.findAll(req.tenantId, {
      ...query,
      conversationId,
    });
  }
}
