import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MessagesService } from './messages.service.js';
import { BotResponseDto } from './dto/bot-response.dto.js';
import { MessageDocument } from './schemas/message.schema.js';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

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
  async botResponse(@Body() dto: BotResponseDto): Promise<MessageDocument> {
    return this.messagesService.processBotResponse(dto);
  }
}
