import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { Request as ExpressRequest } from 'express';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { FindBookingsDto } from './dto/find-bookings.dto.js';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @AllowAnonymous()
  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto.tenantId, dto);
  }

  @Get()
  findAll(
    @Query() dto: FindBookingsDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ) {
    if (!req.tenantId) throw new UnauthorizedException('Tenant not resolved');
    return this.bookingsService.findAll(req.tenantId, dto);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { tenantId?: string },
  ) {
    if (!req.tenantId) throw new UnauthorizedException('Tenant not resolved');
    return this.bookingsService.findOne(req.tenantId, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @Request() req: ExpressRequest & { tenantId?: string },
  ) {
    if (!req.tenantId) throw new UnauthorizedException('Tenant not resolved');
    return this.bookingsService.update(req.tenantId, id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Request() req: ExpressRequest & { tenantId?: string },
  ) {
    if (!req.tenantId) throw new UnauthorizedException('Tenant not resolved');
    return this.bookingsService.remove(req.tenantId, id);
  }
}
