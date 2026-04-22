import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema.js';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema.js';
import { TenantsService } from '../tenants/tenants.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { FindBookingsDto } from './dto/find-bookings.dto.js';

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

  async create(tenantId: string, dto: CreateBookingDto): Promise<BookingDocument> {
    const resolvedTenantId = await this.tenantsService.resolveId(tenantId);
    const customerId = await this.resolveCustomerId(resolvedTenantId, dto.customerId);
    const booking = new this.bookingModel({
      tenantId: new Types.ObjectId(resolvedTenantId),
      customerId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      ...(dto.status && { status: dto.status }),
    });
    return booking.save();
  }

  async findAll(tenantId: string, dto: FindBookingsDto): Promise<BookingDocument[]> {
    const { status, customerId, before, limit = 20 } = dto;
    const tenantObjectId = new Types.ObjectId(tenantId);

    const filter: Record<string, unknown> = { tenantId: tenantObjectId };

    if (status) {
      filter['status'] = status;
    }

    if (customerId) {
      filter['customerId'] = new Types.ObjectId(customerId);
    }

    if (before) {
      filter['startDate'] = { $lt: new Date(before) };
    }

    return this.bookingModel
      .find(filter)
      .sort({ startDate: -1 })
      .limit(limit)
      .lean()
      .exec() as unknown as BookingDocument[];
  }

  async findOne(tenantId: string, id: string): Promise<BookingDocument> {
    const booking = await this.bookingModel
      .findOne({
        _id: new Types.ObjectId(id),
        tenantId: new Types.ObjectId(tenantId),
      })
      .lean()
      .exec();

    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }

    return booking as unknown as BookingDocument;
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
