import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema.js';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema.js';
import { Message, MessageDocument } from '../messages/schemas/message.schema.js';
import { CountMessagesDto } from '../messages/dto/count-messages.dto.js';

export type ConversationWithCustomer = Omit<Conversation, 'customerId'> & {
  _id: Types.ObjectId;
  customer: Customer;
  createdAt?: Date;
  updatedAt?: Date;
};
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { UpdateConversationDto } from './dto/update-conversation.dto.js';
import { FindConversationsDto } from './dto/find-conversations.dto.js';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async count(
    tenantId: string,
    dto: CountMessagesDto = {},
  ): Promise<{ total: number; whatsapp: number; instagram: number }> {
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

    const rows = await this.conversationModel.aggregate<{
      channel: string;
      count: number;
    }>([
      { $match: match },
      {
        $lookup: {
          from: this.messageModel.collection.name,
          let: { convId: '$_id', tenantId: '$tenantId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$conversationId', '$$convId'] },
                    { $eq: ['$tenantId', '$$tenantId'] },
                  ],
                },
              },
            },
            { $count: 'total' },
          ],
          as: 'messageSummary',
        },
      },
      { $match: { 'messageSummary.0.total': { $gt: 2 } } },
      { $group: { _id: '$channel', count: { $sum: 1 } } },
      { $project: { _id: 0, channel: '$_id', count: 1 } },
    ]);

    const result = { total: 0, whatsapp: 0, instagram: 0 };
    for (const row of rows) {
      const key = row.channel.toLowerCase() as 'whatsapp' | 'instagram';
      result[key] = row.count;
      result.total += row.count;
    }

    return result;
  }

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
  ): Promise<ConversationWithCustomer[]> {
    const { status, before, limit = 20, search } = dto;
    const tenantObjectId = new Types.ObjectId(tenantId);

    const filter: Record<string, unknown> = { tenantId: tenantObjectId };

    if (status) {
      filter['status'] = status;
    }

    if (before) {
      filter['lastMessageAt'] = { $lt: new Date(before) };
    }

    if (search) {
      const matchingCustomers = await this.customerModel
        .find(
          { tenantId: tenantObjectId, name: { $regex: search, $options: 'i' } },
          { _id: 1 },
        )
        .lean()
        .exec();
      filter['customerId'] = { $in: matchingCustomers.map((c) => c._id) };
    }

    const conversations = await this.conversationModel
      .find(filter)
      .sort({ lastMessageAt: -1 })
      .limit(limit)
      .populate('lastMessage')
      .populate('customerId')
      .lean()
      .exec();

    return conversations.map(({ customerId, ...rest }) => ({
      ...rest,
      customer: customerId as unknown as Customer,
    })) as ConversationWithCustomer[];
  }

  /**
   * Toggles the bot on/off for a conversation scoped to the tenant.
   * Sets botEnabled to the opposite of its current value and records
   * botDisabledAt when disabling.
   */
  async toggleBot(
    tenantId: string,
    conversationId: string,
  ): Promise<Pick<Conversation, 'botEnabled' | 'botDisabledAt'>> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const conversationObjectId = new Types.ObjectId(conversationId);

    const conversation = await this.conversationModel
      .findOne({ _id: conversationObjectId, tenantId: tenantObjectId })
      .lean()
      .exec();

    if (!conversation) {
      throw new NotFoundException(
        `Conversation ${conversationId} not found for tenant ${tenantId}`,
      );
    }

    const botEnabled = !conversation.botEnabled;
    const update: Record<string, unknown> = { botEnabled };

    if (!botEnabled) {
      update['botDisabledAt'] = new Date();
    }

    return this.conversationModel
      .findByIdAndUpdate(conversationObjectId, update, { new: true })
      .select('botEnabled botDisabledAt')
      .lean()
      .exec() as Promise<Pick<Conversation, 'botEnabled' | 'botDisabledAt'>>;
  }

  /**
   * Marks a conversation as read: resets unreadCount to 0 and sets readAt.
   * Returns the fields needed for the conversation_read socket event.
   */
  async markAsRead(
    tenantId: string,
    conversationId: string,
  ): Promise<{ conversationId: string; unreadCount: 0; readAt: string }> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const conversationObjectId = new Types.ObjectId(conversationId);
    const readAt = new Date();

    const updated = await this.conversationModel
      .findOneAndUpdate(
        { _id: conversationObjectId, tenantId: tenantObjectId },
        { unreadCount: 0, readAt },
        { new: true },
      )
      .select('_id')
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Conversation ${conversationId} not found for tenant ${tenantId}`,
      );
    }

    return {
      conversationId,
      unreadCount: 0,
      readAt: readAt.toISOString(),
    };
  }

  /**
   * Sets requestingAgent = false on the conversation and emits a dismiss_agent event.
   * Throws NotFoundException if the conversation does not exist or belongs to a different tenant.
   */
  async dismissAgent(
    tenantId: string,
    conversationId: string,
  ): Promise<{ conversationId: string }> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const conversationObjectId = new Types.ObjectId(conversationId);

    const updated = await this.conversationModel
      .findOneAndUpdate(
        { _id: conversationObjectId, tenantId: tenantObjectId },
        { requestingAgent: false },
        { new: true },
      )
      .select('_id')
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Conversation ${conversationId} not found for tenant ${tenantId}`,
      );
    }

    return { conversationId };
  }

  /**
   * Adds a tag to a conversation (idempotent via $addToSet).
   * Returns the updated tags array.
   */
  async addTag(
    tenantId: string,
    conversationId: string,
    tagId: string,
  ): Promise<{ conversationId: string; tags: string[] }> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const conversationObjectId = new Types.ObjectId(conversationId);
    const tagObjectId = new Types.ObjectId(tagId);

    const updated = await this.conversationModel
      .findOneAndUpdate(
        { _id: conversationObjectId, tenantId: tenantObjectId },
        { $addToSet: { tags: tagObjectId } },
        { new: true },
      )
      .select('tags')
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Conversation ${conversationId} not found for tenant ${tenantId}`,
      );
    }

    return {
      conversationId,
      tags: (updated.tags as Types.ObjectId[]).map((id) => id.toString()),
    };
  }

  /**
   * Removes a tag from a conversation.
   * Returns the updated tags array.
   */
  async removeTag(
    tenantId: string,
    conversationId: string,
    tagId: string,
  ): Promise<{ conversationId: string; tags: string[] }> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const conversationObjectId = new Types.ObjectId(conversationId);
    const tagObjectId = new Types.ObjectId(tagId);

    const updated = await this.conversationModel
      .findOneAndUpdate(
        { _id: conversationObjectId, tenantId: tenantObjectId },
        { $pull: { tags: tagObjectId } },
        { new: true },
      )
      .select('tags')
      .lean()
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Conversation ${conversationId} not found for tenant ${tenantId}`,
      );
    }

    return {
      conversationId,
      tags: (updated.tags as Types.ObjectId[]).map((id) => id.toString()),
    };
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
