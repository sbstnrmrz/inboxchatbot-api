import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagsService } from './tags.service.js';
import { TagsController } from './tags.controller.js';
import { Tag, TagSchema } from './schemas/tag.schema.js';
import { ConversationsModule } from '../conversations/conversations.module.js';
import { ChatModule } from '../chat/chat.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }]),
    forwardRef(() => ConversationsModule),
    forwardRef(() => ChatModule),
  ],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [MongooseModule, TagsService],
})
export class TagsModule {}
