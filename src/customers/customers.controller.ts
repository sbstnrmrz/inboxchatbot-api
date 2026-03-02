import {
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
  CustomerWithMessageCount,
} from './customers.service.js';
import { FindCustomersDto } from './dto/find-customers.dto.js';
import { CustomerDocument } from './schemas/customer.schema.js';

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
   * Returns a paginated list of customers enriched with a `messageCount` field
   * containing the total number of messages across all their conversations.
   *
   * Accepts the same cursor-based pagination and search query params as GET /customers.
   *
   * GET /customers/additional
   */
  @Get('additional')
  async findAllWithMessageCount(
    @Query() dto: FindCustomersDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ): Promise<CustomerWithMessageCount[]> {
    if (!req.tenantId) {
      throw new UnauthorizedException('Tenant not resolved');
    }

    return this.customersService.findAllWithMessageCount(req.tenantId, dto);
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
