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
  ) {}

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
}
