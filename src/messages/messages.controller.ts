import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { BotResponseDto } from './dto/bot-response.dto.js';
import {
  MessageDocument,
  MessageReceivedResult,
} from './schemas/message.schema.js';
import type { MessageReceivedDto } from './dto/message-received.dto.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('messages')
export class MessagesController {
  private readonly logger = new Logger(MessagesController.name);

  constructor(private readonly messagesService: MessagesService) {}

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
    @Body() payload: MessageReceivedDto,
  ): Promise<MessageReceivedResult[]> {
    if (!tenantId) {
      throw new BadRequestException('Missing required header: Tenant-Id');
    }
    return this.messagesService.messageReceived(tenantId, payload);
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
    @Body() dto: BotResponseDto,
    @Query('request_agent') requestAgent?: string,
  ): Promise<MessageDocument> {
    this.logger.debug(
      `[bot-response] query params: ${JSON.stringify({ request_agent: requestAgent })}`,
    );
    return this.messagesService.processBotResponse(dto);
  }
}
