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
import { Logger } from '@nestjs/common';
import { MessageEvent } from './enums/message-events.enum';
import { SocketAuthGuard } from 'src/auth/guards/socket-auth.guard';
import { TenantsService } from '../tenants/tenants.service';

// Build allowed origins list: exact origins + subdomain RegExp for each
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOrigins = allowedOrigins.flatMap((origin) => {
  const { hostname, port, protocol } = new URL(origin);
  return [
    origin,
    new RegExp(
      `^${protocol}//[^.]+\\.${hostname.replace('.', '\\.')}${port ? `:${port}` : ''}$`,
    ),
  ];
});

@WebSocketGateway({
  path: '/socket',
  cors: {
    origin: corsOrigins,
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
