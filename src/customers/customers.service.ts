import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema.js';
import {
  Conversation,
  ConversationDocument,
} from '../conversations/schemas/conversation.schema.js';
import {
  Message,
  MessageDocument,
} from '../messages/schemas/message.schema.js';
import { FindCustomersDto } from './dto/find-customers.dto.js';
import { CountMessagesDto } from '../messages/dto/count-messages.dto.js';
import { ChatGateway } from '../chat/chat.gateway.js';
import { CustomerEvent } from '../chat/enums/customer-events.enum.js';

export type CustomerWithMessageCount = CustomerDocument & {
  conversationId: Types.ObjectId | null;
  messageCount: number;
};

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async count(tenantId: string, dto: CountMessagesDto = {}): Promise<number> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const filter: Record<string, unknown> = { tenantId: tenantObjectId };

    if (dto.date) {
      const start = new Date(dto.date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(dto.date);
      end.setUTCHours(23, 59, 59, 999);
      filter['createdAt'] = { $gte: start, $lte: end };
    } else if (dto.from || dto.to) {
      const range: Record<string, Date> = {};
      if (dto.from) range['$gte'] = new Date(dto.from);
      if (dto.to) {
        const end = new Date(dto.to);
        if (!/T\d{2}:\d{2}/.test(dto.to)) end.setUTCHours(23, 59, 59, 999);
        range['$lte'] = end;
      }
      filter['createdAt'] = range;
    }

    return this.customerModel.countDocuments(filter).exec();
  }

  /**
   * Returns a single customer by ID scoped to the tenant.
   * Throws NotFoundException if the customer does not exist or belongs to a different tenant.
   */
  async findById(
    tenantId: string,
    customerId: string,
  ): Promise<CustomerDocument> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const customerObjectId = new Types.ObjectId(customerId);

    const customer = await this.customerModel
      .findOne({ _id: customerObjectId, tenantId: tenantObjectId })
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException(`Customer with id "${customerId}" not found`);
    }

    return customer as CustomerDocument;
  }

  /**
   * Returns a paginated list of customers for a tenant, ordered by
   * createdAt DESC (newest first).
   *
   * Cursor-based pagination on `createdAt`:
   *   - First page: omit `before`
   *   - Next pages : pass `before` = createdAt of the last customer in the previous page
   *
   * Optional: `search` for case-insensitive name filtering.
   */
  async findAll(
    tenantId: string,
    dto: FindCustomersDto,
  ): Promise<CustomerDocument[]> {
    const { before, limit = 20, search } = dto;
    const tenantObjectId = new Types.ObjectId(tenantId);

    const filter: Record<string, unknown> = { tenantId: tenantObjectId };

    if (before) {
      filter['createdAt'] = { $lt: new Date(before) };
    }

    if (search) {
      filter['name'] = { $regex: search, $options: 'i' };
    }

    return this.customerModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec() as Promise<CustomerDocument[]>;
  }

  /**
   * Returns a paginated list of customers enriched with a `messageCount` field,
   * representing the total number of messages sent by each customer across all
   * their conversations within the tenant.
   *
   * Uses an aggregation pipeline:
   *   customers → lookup conversations → lookup messages → count messages
   *
   * Cursor-based pagination and search follow the same semantics as `findAll`.
   */
  async findAllWithMessageCount(
    tenantId: string,
    dto: FindCustomersDto,
  ): Promise<CustomerWithMessageCount[]> {
    const { before, limit = 20, search } = dto;
    const tenantObjectId = new Types.ObjectId(tenantId);

    const matchStage: Record<string, unknown> = { tenantId: tenantObjectId };

    if (before) {
      matchStage['createdAt'] = { $lt: new Date(before) };
    }

    if (search) {
      matchStage['name'] = { $regex: search, $options: 'i' };
    }

    const results =
      await this.customerModel.aggregate<CustomerWithMessageCount>([
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        // Join the conversation that belongs to this customer within the tenant
        {
          $lookup: {
            from: this.conversationModel.collection.name,
            let: { customerId: '$_id', tenantId: '$tenantId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$customerId', '$$customerId'] },
                      { $eq: ['$tenantId', '$$tenantId'] },
                    ],
                  },
                },
              },
              { $project: { _id: 1 } },
            ],
            as: 'conversations',
          },
        },
        // Join messages that belong to those conversations within the tenant
        {
          $lookup: {
            from: this.messageModel.collection.name,
            let: {
              conversationIds: '$conversations._id',
              tenantId: '$tenantId',
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ['$conversationId', '$$conversationIds'] },
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
        // Project final shape: all customer fields + conversationId + messageCount
        {
          $addFields: {
            conversationId: {
              $ifNull: [{ $arrayElemAt: ['$conversations._id', 0] }, null],
            },
            messageCount: {
              $ifNull: [{ $arrayElemAt: ['$messageSummary.total', 0] }, 0],
            },
          },
        },
        {
          $project: {
            conversations: 0,
            messageSummary: 0,
          },
        },
      ]);

    return results;
  }

  /**
   * Sets email on a customer found by their WhatsApp id or Instagram accountId.
   * Throws NotFoundException if no matching customer is found within the tenant.
   */
  async addEmail(
    tenantId: string,
    platformId: string,
    email: string,
  ): Promise<CustomerDocument> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    const customer = await this.customerModel
      .findOneAndUpdate(
        {
          tenantId: tenantObjectId,
          $or: [
            { 'whatsappInfo.id': platformId },
            { 'instagramInfo.accountId': platformId },
          ],
        },
        { email },
        { new: true },
      )
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException(
        `Customer with platform id "${platformId}" not found`,
      );
    }

    return customer as CustomerDocument;
  }

  /**
   * Sets isBlocked = true on the customer and emits a customer_blocked event.
   * Throws NotFoundException if the customer does not exist or belongs to a different tenant.
   */
  async blockCustomer(
    tenantId: string,
    customerId: string,
  ): Promise<CustomerDocument> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const customerObjectId = new Types.ObjectId(customerId);

    const customer = await this.customerModel
      .findOneAndUpdate(
        { _id: customerObjectId, tenantId: tenantObjectId },
        { isBlocked: true },
        { new: true },
      )
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException(`Customer with id "${customerId}" not found`);
    }

    this.chatGateway.emitToTenant(tenantId, CustomerEvent.Blocked, {
      customerId: customerObjectId,
    });

    return customer as CustomerDocument;
  }

  /**
   * Sets isBlocked = false on the customer and emits a customer_unblocked event.
   * Throws NotFoundException if the customer does not exist or belongs to a different tenant.
   */
  async unblockCustomer(
    tenantId: string,
    customerId: string,
  ): Promise<CustomerDocument> {
    const tenantObjectId = new Types.ObjectId(tenantId);
    const customerObjectId = new Types.ObjectId(customerId);

    const customer = await this.customerModel
      .findOneAndUpdate(
        { _id: customerObjectId, tenantId: tenantObjectId },
        { isBlocked: false },
        { new: true },
      )
      .lean()
      .exec();

    if (!customer) {
      throw new NotFoundException(`Customer with id "${customerId}" not found`);
    }

    this.chatGateway.emitToTenant(tenantId, CustomerEvent.Unblocked, {
      customerId: customerObjectId,
    });

    return customer as CustomerDocument;
  }
}
