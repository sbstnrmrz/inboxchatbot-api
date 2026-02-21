import { forwardRef, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { SocketAuthGuard } from '../auth/guards/socket-auth.guard';
import { TenantsModule } from '../tenants/tenants.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    TenantsModule,
    ConversationsModule,
    forwardRef(() => MessagesModule),
  ],
  providers: [ChatGateway, SocketAuthGuard],
  exports: [ChatGateway],
})
export class ChatModule {}
