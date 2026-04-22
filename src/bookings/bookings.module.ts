import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service.js';
import { BookingsController } from './bookings.controller.js';
import { Booking, BookingSchema } from './schemas/booking.schema.js';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema.js';
import { TenantsModule } from '../tenants/tenants.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
    TenantsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [MongooseModule, BookingsService],
})
export class BookingsModule {}
