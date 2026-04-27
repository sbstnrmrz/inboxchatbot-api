import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request as ExpressRequest } from 'express';
import { MessagesService } from './messages.service.js';
import { BotResponseDto } from './dto/bot-response.dto.js';
import {
  MessageDocument,
  MessageReceivedResult,
} from './schemas/message.schema.js';
import type { MessageReceivedDto } from './dto/message-received.dto.js';
import { CountMessagesDto } from './dto/count-messages.dto.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Controller('messages')
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Returns the total number of messages for the current tenant.
   *
   * GET /messages/count
   */
  @Get('count')
  async count(
    @Query() dto: CountMessagesDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<{ total: number; whatsapp: number; instagram: number }> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }
    return this.messagesService.count(req.tenantId, dto);
  }

  /**
   * Returns the total number of messages for a specific tenant by ID.
   * Intended for admin/cross-tenant use.
   *
   * GET /messages/count/:tenantId
   */
  @Get('count/:tenantId')
  async countByTenant(
    @Param('tenantId') tenantId: string,
    @Query() dto: CountMessagesDto,
  ): Promise<{ total: number; whatsapp: number; instagram: number }> {
    return this.messagesService.count(tenantId, dto);
  }

  /**
   * POST /messages/send-media
   * Uploads a media file and sends it as an outbound message via the
   * conversation's channel (WhatsApp or Instagram).
   *
   * Expects multipart/form-data with:
   *   file          — the image binary
   *   conversationId — the target conversation (MongoId)
   *   caption        — optional caption text
   */
  @Post('send-media')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }),
  )
  async sendMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body('conversationId') conversationId: string,
    @Body('caption') caption: string | undefined,
    @Request()
    req: ExpressRequest & {
      tenantId?: string;
      session?: { user?: { tenantId?: string; id?: string } };
    },
  ): Promise<MessageDocument> {
    const tenantId = req.tenantId ?? (req as any).session?.user?.tenantId;
    const agentId = (req as any).session?.user?.id;

    if (!tenantId || !agentId) {
      throw new BadRequestException('Not authenticated');
    }
    if (!conversationId) {
      throw new BadRequestException('conversationId is required');
    }
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Allowed: ${[...ALLOWED_MIME_TYPES].join(', ')}`,
      );
    }

    return this.messagesService.sendMediaMessage(
      tenantId,
      agentId,
      conversationId,
      file,
      caption,
    );
  }

  /**
   * Unified inbound message endpoint called by n8n after receiving a
   * webhook from Meta.  The channel is auto-detected from the payload:
   *   - WhatsApp : payload.messaging_product === 'whatsapp'
   *   - Instagram: payload.object === 'instagram'
   *
   * The tenant is identified via the required `Tenant-Id` header (ObjectId
   * or slug).
   *
   * POST /messages/receive
   */
  @Post('receive')
  @HttpCode(HttpStatus.OK)
  @AllowAnonymous()
  async messageReceived(
    @Headers('tenant-id') tenantId: string,
    @Headers('execId') execId: string | undefined,
    @Body() payload: MessageReceivedDto,
  ): Promise<MessageReceivedResult[]> {
    if (!tenantId) {
      throw new BadRequestException('Missing required header: Tenant-Id');
    }
    return this.messagesService.messageReceived(tenantId, payload, execId);
  }

  /**
   * Registers an outbound message that was already sent by a bot via the
   * Meta API.  The bot supplies the phoneNumberId, the tenant identifier
   * (slug or ObjectId), the message content, and the verbatim Meta API
   * response so we can persist the wamid as externalId.
   *
   * POST /messages/bot-response
   */
  @Post('bot-response')
  @HttpCode(HttpStatus.CREATED)
  @AllowAnonymous()
  async botResponse(
    @Headers('execId') execId: string | undefined,
    @Body() dto: BotResponseDto,
    @Query('request_agent') requestAgent?: string,
    @Query('add_tags') addTagsParam?: string,
    @Query('remove_tags') removeTagsParam?: string,
    @Query('remove_all_tags') removeAllTagsParam?: string,
  ): Promise<MessageDocument> {
    const addTags = addTagsParam
      ? addTagsParam
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => {
            const dashIdx = t.lastIndexOf('-');
            if (dashIdx !== -1) {
              const colorPart = t.slice(dashIdx + 1);
              const name = t.slice(0, dashIdx);
              const color = /^[0-9a-fA-F]{6}$/.test(colorPart)
                ? `#${colorPart}`
                : undefined;
              return { name, color };
            }
            return { name: t };
          })
      : undefined;
    const removeTags = removeTagsParam
      ? removeTagsParam.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    const removeAllTags = removeAllTagsParam === 'true';

    this.logger.debug(
      `[bot-response] query params: ${JSON.stringify({ request_agent: requestAgent, add_tags: addTags, remove_tags: removeTags, remove_all_tags: removeAllTags })}`,
    );
    return this.messagesService.processBotResponse(
      dto,
      requestAgent === 'true',
      addTags,
      removeTags,
      removeAllTags,
      execId,
    );
  }
}
