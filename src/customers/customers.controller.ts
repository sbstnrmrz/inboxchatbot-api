import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import {
  CustomersService,
  PaginatedCustomersWithMessageCount,
} from './customers.service.js';
import { FindCustomersDto } from './dto/find-customers.dto.js';
import { FindCustomersAdditionalDto } from './dto/find-customers-additional.dto.js';
import { AddEmailDto } from './dto/add-email.dto.js';
import { CustomerDocument } from './schemas/customer.schema.js';
import { CountMessagesDto } from '../messages/dto/count-messages.dto.js';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Returns a paginated list of customers for the current tenant,
   * ordered by createdAt DESC.
   *
   * Cursor-based pagination on `createdAt`:
   *   - First page : GET /customers?limit=20
   *   - Next page  : GET /customers?limit=20&before=<createdAt of last customer>
   *
   * Optional filter: ?search=<name substring>
   *
   * GET /customers
   */
  @Get()
  async findAll(
    @Query() dto: FindCustomersDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<CustomerDocument[]> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.customersService.findAll(req.tenantId, dto);
  }

  /**
   * Returns the total number of customers for the current tenant.
   * Optionally filtered by creation date (= first message day) via `date`, `from`, or `to`.
   *
   * GET /customers/count
   */
  @Get('count')
  async count(
    @Query() dto: CountMessagesDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<{ total: number; whatsapp: number; instagram: number }> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }
    return this.customersService.count(req.tenantId, dto);
  }

  /**
   * Returns the total number of customers for a specific tenant by ID.
   * Intended for admin/cross-tenant use.
   *
   * GET /customers/count/:tenantId
   */
  @Get('count/:tenantId')
  async countByTenant(
    @Param('tenantId') tenantId: string,
    @Query() dto: CountMessagesDto,
  ): Promise<{ total: number; whatsapp: number; instagram: number }> {
    return this.customersService.count(tenantId, dto);
  }

  /**
   * Returns a paginated list of customers enriched with a `messageCount` field
   * containing the total number of messages across all their conversations.
   *
   * Supports page/limit pagination and optional search by name.
   *
   * GET /customers/additional
   */
  @Get('additional')
  async findAllWithMessageCount(
    @Query() dto: FindCustomersAdditionalDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<PaginatedCustomersWithMessageCount> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.customersService.findAllWithMessageCount(req.tenantId, dto);
  }

  /**
   * Adds or updates the email of a customer found by their WhatsApp id or Instagram accountId.
   *
   * PATCH /customers/:id/add-email
   */
  @Patch(':id/add-email')
  @HttpCode(HttpStatus.OK)
  async addEmail(
    @Param('id') id: string,
    @Body() dto: AddEmailDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<CustomerDocument> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.customersService.addEmail(req.tenantId, id, dto.email);
  }

  /**
   * Blocks a customer, setting isBlocked = true.
   * Emits a customer_blocked socket event to the tenant room.
   *
   * PATCH /customers/:id/block
   */
  @Patch(':id/block')
  @HttpCode(HttpStatus.OK)
  async blockCustomer(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<CustomerDocument> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.customersService.blockCustomer(req.tenantId, id);
  }

  /**
   * Unblocks a customer, setting isBlocked = false.
   * Emits a customer_unblocked socket event to the tenant room.
   *
   * PATCH /customers/:id/unblock
   */
  @Patch(':id/unblock')
  @HttpCode(HttpStatus.OK)
  async unblockCustomer(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<CustomerDocument> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.customersService.unblockCustomer(req.tenantId, id);
  }

  /**
   * Returns a single customer by ID for the current tenant.
   * Throws 404 if the customer does not exist or belongs to a different tenant.
   *
   * GET /customers/:id
   */
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<CustomerDocument> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.customersService.findById(req.tenantId, id);
  }
}
