import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { SocketAuthGuard } from '../auth/guards/socket-auth.guard';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  providers: [ChatGateway, SocketAuthGuard],
})
export class ChatModule {}
