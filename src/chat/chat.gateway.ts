import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from './enums/socket-events.enum';
import { Logger, UseGuards } from '@nestjs/common';
import { MessageEvent } from './enums/message-events.enum';
import { SocketAuthGuard } from 'src/auth/guards/socket-auth.guard';
import { ConfigService } from '@nestjs/config';
import { TenantsService } from '../tenants/tenants.service';

// TODO: when production config origin
@WebSocketGateway({
  path: '/socket',
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketAuthGuard: SocketAuthGuard,
    private readonly tenantsService: TenantsService,
  ) {}

  private readonly logger = new Logger(ChatGateway.name);

  @SubscribeMessage(SocketEvent.Connect)
  async handleConnection(client: Socket) {
    this.logger.debug('Socket client trying to connect');
    try {
      const isAuthorized = await this.socketAuthGuard.canActivate({
        switchToWs: () => ({ getClient: () => client }),
      } as any);
      if (!isAuthorized) {
        client.disconnect();
        return;
      }

      const tenantId = client.data.session.user.tenantId;
      await client.join(tenantId);
      const tenantSlug = await this.tenantsService.getSlugById(tenantId);
      this.logger.debug(
        `Socket client ${client.id} joined tenant room ${tenantId} (${tenantSlug}) ✅`,
      );
    } catch (error) {
      this.logger.error(`Socket client ${client.id} failed to connect`);
      client.disconnect();
    }

    return 'Hello world!';
  }

  async handleDisconnect(client: Socket) {
    this.logger.debug(`Socket client ${client.id} disconnected`);
  }

  @SubscribeMessage(MessageEvent.Sent)
  handleMessageSent(@ConnectedSocket() client: Socket, payload: any): string {
    return 'Hello world!';
  }
}
