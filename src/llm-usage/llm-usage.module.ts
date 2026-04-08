import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LlmUsage, LlmUsageSchema } from './schemas/llm-usage.schema.js';
import { LlmUsageService } from './llm-usage.service.js';
import { LlmUsageController } from './llm-usage.controller.js';
import { TenantsModule } from '../tenants/tenants.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: LlmUsage.name, schema: LlmUsageSchema }]),
    TenantsModule,
  ],
  controllers: [LlmUsageController],
  providers: [LlmUsageService],
  exports: [LlmUsageService],
})
export class LlmUsageModule {}
