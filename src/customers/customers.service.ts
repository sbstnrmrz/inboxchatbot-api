import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema.js';
import { FindCustomersDto } from './dto/find-customers.dto.js';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
  ) {}

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
}
