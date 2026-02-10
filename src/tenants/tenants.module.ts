import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsController } from './tenants.controller.js';
import { TenantsService } from './tenants.service.js';
import { Tenant, TenantSchema } from './schemas/tenant.schema.js';
import { MembershipsModule } from '../memberships/memberships.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    MembershipsModule,
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
