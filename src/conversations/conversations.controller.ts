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
import { Conversation } from './schemas/conversation.schema.js';
import { ConversationWithCustomer } from './conversations.service.js';
import { MessagesService } from '../messages/messages.service.js';
import { FindMessagesDto } from '../messages/dto/find-messages.dto.js';
import { MessageDocument } from '../messages/schemas/message.schema.js';
import { ChatGateway } from '../chat/chat.gateway.js';
import { ConversationEvent } from '../chat/enums/conversation-events.enum.js';
import { TagEvent } from '../chat/enums/tag-events.enum.js';
import { CountMessagesDto } from '../messages/dto/count-messages.dto.js';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    private readonly chatGateway: ChatGateway,
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
  ): Promise<ConversationWithCustomer[]> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.conversationsService.findAll(req.tenantId, dto);
  }

  /**
   * Returns the total number of conversations with more than 2 messages for the current tenant.
   * Optionally filtered by creation date via `date`, `from`, or `to`.
   *
   * GET /conversations/count
   */
  @Get('count')
  async count(
    @Query() dto: CountMessagesDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<{ total: number; whatsapp: number; instagram: number }> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }
    return this.conversationsService.count(req.tenantId, dto);
  }

  /**
   * Returns the total number of conversations with more than 2 messages for a specific tenant by ID.
   * Intended for admin/cross-tenant use.
   *
   * GET /conversations/count/:tenantId
   */
  @Get('count/:tenantId')
  async countByTenant(
    @Param('tenantId') tenantId: string,
    @Query() dto: CountMessagesDto,
  ): Promise<{ total: number; whatsapp: number; instagram: number }> {
    return this.conversationsService.count(tenantId, dto);
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
  /**
   * Toggles bot enabled/disabled for a conversation.
   * PATCH /conversations/:id/toggle-bot
   */
  @Patch(':id/toggle-bot')
  async toggleBot(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<Pick<Conversation, 'botEnabled' | 'botDisabledAt'>> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.conversationsService.toggleBot(req.tenantId, id);
  }

  /**
   * Clears the agent request flag on a conversation, setting requestingAgent = false.
   * Emits a dismiss_agent socket event to the tenant room.
   *
   * PATCH /conversations/:id/dismiss-agent
   */
  @Patch(':id/dismiss-agent')
  async dismissAgent(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<{ conversationId: string }> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    const payload = await this.conversationsService.dismissAgent(
      req.tenantId,
      id,
    );
    this.chatGateway.emitToTenant(
      req.tenantId,
      ConversationEvent.DismissAgent,
      payload,
    );
    return payload;
  }

  /**
   * Adds a tag to a conversation.
   * POST /conversations/:id/tags/:tagId
   */
  @Post(':id/tags/:tagId')
  async addTag(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<{ conversationId: string; tags: string[] }> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    const payload = await this.conversationsService.addTag(
      req.tenantId,
      id,
      tagId,
    );
    this.chatGateway.emitToTenant(
      req.tenantId,
      TagEvent.AddedToConversation,
      payload,
    );
    return payload;
  }

  /**
   * Removes a tag from a conversation.
   * DELETE /conversations/:id/tags/:tagId
   */
  @Delete(':id/tags/:tagId')
  async removeTag(
    @Param('id') id: string,
    @Param('tagId') tagId: string,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<{ conversationId: string; tags: string[] }> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    const payload = await this.conversationsService.removeTag(
      req.tenantId,
      id,
      tagId,
    );
    this.chatGateway.emitToTenant(
      req.tenantId,
      TagEvent.RemovedFromConversation,
      payload,
    );
    return payload;
  }

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
