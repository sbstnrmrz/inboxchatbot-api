import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationsService } from './conversations.service.js';
import { ConversationsController } from './conversations.controller.js';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema.js';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema.js';
import { MessagesModule } from '../messages/messages.module.js';
import { ChatModule } from '../chat/chat.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
    MessagesModule,
    forwardRef(() => ChatModule),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [MongooseModule, ConversationsService],
})
export class ConversationsModule {}
