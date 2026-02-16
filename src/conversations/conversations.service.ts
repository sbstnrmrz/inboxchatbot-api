import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { UpdateConversationDto } from './dto/update-conversation.dto.js';
import { FindConversationsDto } from './dto/find-conversations.dto.js';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
  ) {}

  /**
   * Returns a paginated list of conversations for a tenant, ordered by
   * lastMessageAt DESC (most recently active first).
   *
   * Cursor-based pagination on `lastMessageAt`:
   *   - First page: omit `before`
   *   - Next pages : pass `before` = lastMessageAt of the last conversation in the previous page
   */
  async findAll(
    tenantId: string,
    dto: FindConversationsDto,
  ): Promise<ConversationDocument[]> {
    const { status, before, limit = 20 } = dto;
    const tenantObjectId = new Types.ObjectId(tenantId);

    const filter: Record<string, unknown> = { tenantId: tenantObjectId };

    if (status) {
      filter['status'] = status;
    }

    if (before) {
      filter['lastMessageAt'] = { $lt: new Date(before) };
    }

    return this.conversationModel
      .find(filter)
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .lean()
      .exec() as Promise<ConversationDocument[]>;
  }

  create(createConversationDto: CreateConversationDto) {
    return 'This action adds a new conversation';
  }

  findOne(id: number) {
    return `This action returns a #${id} conversation`;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
