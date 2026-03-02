import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './schemas/customer.schema.js';
import {
  Conversation,
  ConversationSchema,
} from '../conversations/schemas/conversation.schema.js';
import { Message, MessageSchema } from '../messages/schemas/message.schema.js';
import { CustomersService } from './customers.service.js';
import { CustomersController } from './customers.controller.js';
import { ChatModule } from '../chat/chat.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    forwardRef(() => ChatModule),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [MongooseModule, CustomersService],
})
export class CustomersModule {}
