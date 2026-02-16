import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsService } from './conversations.service.js';
import { ConversationsController } from './conversations.controller.js';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema.js';
import { MessagesModule } from '../messages/messages.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    MessagesModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [MongooseModule],
})
export class ConversationsModule {}
