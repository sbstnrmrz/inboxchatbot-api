import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument, BookingStatus } from './schemas/booking.schema.js';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema.js';
import { TenantsService } from '../tenants/tenants.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { FindBookingsDto } from './dto/find-bookings.dto.js';
import { CountBookingsDto } from './dto/count-bookings.dto.js';

export type BookingWithCustomer = BookingDocument & { customerName: string };

export type PaginatedBookings = {
  data: BookingWithCustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    private readonly tenantsService: TenantsService,
  ) {}

  private async resolveCustomerId(tenantId: string, rawId: string): Promise<Types.ObjectId> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    if (Types.ObjectId.isValid(rawId)) {
      return new Types.ObjectId(rawId);
    }

    const byWhatsApp = await this.customerModel
      .findOne({ tenantId: tenantObjectId, 'whatsappInfo.id': rawId })
      .select('_id')
      .lean()
      .exec();
    if (byWhatsApp) return byWhatsApp._id as Types.ObjectId;

    const byInstagram = await this.customerModel
      .findOne({ tenantId: tenantObjectId, 'instagramInfo.accountId': rawId })
      .select('_id')
      .lean()
      .exec();
    if (byInstagram) return byInstagram._id as Types.ObjectId;

    throw new NotFoundException(`No customer found for id ${rawId}`);
  }

  private buildDateFilter(dto: CountBookingsDto, field: string): Record<string, unknown> {
    if (dto.date) {
      const start = new Date(dto.date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(dto.date);
      end.setUTCHours(23, 59, 59, 999);
      return { [field]: { $gte: start, $lte: end } };
    }
    if (dto.from || dto.to) {
      const range: Record<string, Date> = {};
      if (dto.from) range['$gte'] = new Date(dto.from);
      if (dto.to) {
        const end = new Date(dto.to);
        if (!/T\d{2}:\d{2}/.test(dto.to)) end.setUTCHours(23, 59, 59, 999);
        range['$lte'] = end;
      }
      return { [field]: range };
    }
    return {};
  }

  private async aggregateByStatus(
    match: Record<string, unknown>,
  ): Promise<{ total: number; pending: number; completed: number }> {
    const rows = await this.bookingModel.aggregate<{ status: string; count: number }>([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
    ]);

    const result = { total: 0, pending: 0, completed: 0 };
    for (const row of rows) {
      const key = row.status.toLowerCase() as 'pending' | 'completed';
      result[key] = row.count;
      result.total += row.count;
    }
    return result;
  }

  async count(
    tenantId: string,
    dto: CountBookingsDto = {},
  ): Promise<{ total: number; pending: number; completed: number }> {
    const match: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId),
      ...this.buildDateFilter(dto, 'startDate'),
    };
    return this.aggregateByStatus(match);
  }

  async countCreated(
    tenantId: string,
    dto: CountBookingsDto = {},
  ): Promise<{ total: number; pending: number; completed: number }> {
    const match: Record<string, unknown> = {
      tenantId: new Types.ObjectId(tenantId),
      ...this.buildDateFilter(dto, 'createdAt'),
    };
    return this.aggregateByStatus(match);
  }

  async create(tenantId: string, dto: CreateBookingDto): Promise<BookingDocument> {
    const resolvedTenantId = await this.tenantsService.resolveId(tenantId);
    const customerId = await this.resolveCustomerId(resolvedTenantId, dto.customerId);
    this.logger.log(`Creating booking for customerId=${customerId} tenantId=${resolvedTenantId}`);

    if (dto.email) {
      await this.customerModel
        .updateOne({ _id: customerId, tenantId: new Types.ObjectId(resolvedTenantId) }, { email: dto.email })
        .exec();
    }

    const booking = new this.bookingModel({
      tenantId: new Types.ObjectId(resolvedTenantId),
      customerId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      ...(dto.status && { status: dto.status }),
    });
    return booking.save();
  }

  async findAll(tenantId: string, dto: FindBookingsDto): Promise<PaginatedBookings> {
    const { status, customerId, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;
    const tenantObjectId = new Types.ObjectId(tenantId);

    const filter: Record<string, unknown> = { tenantId: tenantObjectId };

    if (status) {
      filter['status'] = status;
    }

    if (customerId) {
      filter['customerId'] = new Types.ObjectId(customerId);
    }

    const total = await this.bookingModel.countDocuments(filter);

    const data = await this.bookingModel.aggregate<BookingWithCustomer>([
      { $match: filter },
      { $sort: { startDate: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: this.customerModel.collection.name,
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      {
        $addFields: {
          customerName: { $ifNull: [{ $arrayElemAt: ['$customer.name', 0] }, null] },
        },
      },
      { $project: { customer: 0 } },
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string): Promise<BookingWithCustomer> {
    const [booking] = await this.bookingModel.aggregate<BookingWithCustomer>([
      {
        $match: {
          _id: new Types.ObjectId(id),
          tenantId: new Types.ObjectId(tenantId),
        },
      },
      {
        $lookup: {
          from: this.customerModel.collection.name,
          localField: 'customerId',
          foreignField: '_id',
          as: 'customer',
        },
      },
      {
        $addFields: {
          customerName: { $ifNull: [{ $arrayElemAt: ['$customer.name', 0] }, null] },
        },
      },
      { $project: { customer: 0 } },
    ]);

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking;
  }

  async update(tenantId: string, id: string, dto: UpdateBookingDto): Promise<BookingDocument> {
    const update: Record<string, unknown> = {};

    if (dto.customerId) update['customerId'] = new Types.ObjectId(dto.customerId);
    if (dto.startDate) update['startDate'] = new Date(dto.startDate);
    if (dto.endDate) update['endDate'] = new Date(dto.endDate);
    if (dto.status) update['status'] = dto.status;

    const booking = await this.bookingModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
        update,
        { new: true },
      )
      .lean()
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking as unknown as BookingDocument;
  }

  async updateStatus(tenantId: string, id: string, status: BookingStatus): Promise<BookingDocument> {
    const booking = await this.bookingModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
        { status },
        { new: true },
      )
      .lean()
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking as unknown as BookingDocument;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const result = await this.bookingModel
      .findOneAndDelete({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean()
      .exec();

    if (!result) {
      throw new NotFoundException(`Booking ${id} not found`);
    }
  }
}
