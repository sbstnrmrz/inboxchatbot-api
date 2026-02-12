import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsService } from './conversations.service.js';
import { ConversationsController } from './conversations.controller.js';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [MongooseModule],
})
export class ConversationsModule {}
