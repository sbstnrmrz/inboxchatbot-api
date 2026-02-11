import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { SocketAuthGuard } from '../auth/guards/socket-auth.guard';

@Module({
  providers: [ChatGateway, SocketAuthGuard],
})
export class ChatModule {}
