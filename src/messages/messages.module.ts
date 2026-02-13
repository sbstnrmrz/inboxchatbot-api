import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema.js';
import {
  Customer,
  CustomerSchema,
} from '../customers/schemas/customer.schema.js';
import {
  Conversation,
  ConversationSchema,
} from '../conversations/schemas/conversation.schema.js';
import { Tenant, TenantSchema } from '../tenants/schemas/tenant.schema.js';
import { MessagesService } from './messages.service.js';
import { ChatModule } from '../chat/chat.module.js';

@Module({
  imports: [
    ChatModule,
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  providers: [MessagesService],
  exports: [MessagesService, MongooseModule],
})
export class MessagesModule {}
