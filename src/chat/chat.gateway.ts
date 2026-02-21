import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from './enums/socket-events.enum';
import { forwardRef, Inject, Logger, UseGuards } from '@nestjs/common';
import { MessageEvent } from './enums/message-events.enum';
import { SocketAuthGuard } from '../auth/guards/socket-auth.guard.js';
import { TenantsService } from '../tenants/tenants.service.js';
import { ConversationsService } from '../conversations/conversations.service.js';
import { ConversationEvent } from './enums/conversation-events.enum.js';
import { MessagesService } from '../messages/messages.service.js';
import { SendMessageDto } from '../messages/dto/send-message.dto.js';

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
    private readonly conversationsService: ConversationsService,
    @Inject(forwardRef(() => MessagesService))
    private readonly messagesService: MessagesService,
  ) {}

  private readonly logger = new Logger(ChatGateway.name);

  @SubscribeMessage(SocketEvent.Connect)
  async handleConnection(client: Socket) {
    this.logger.debug('Socket client trying to connect');
    try {
      // this acts like a guard
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
  @UseGuards(SocketAuthGuard)
  async handleMessageSent(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: SendMessageDto,
  ): Promise<void> {
    const tenantId = client.data.session?.user?.tenantId as string | undefined;
    const agentId = client.data.session?.user?.id as string | undefined;

    if (!tenantId || !agentId) {
      this.logger.warn(
        `No tenantId/agentId for client ${client.id}, disconnecting`,
      );
      client.disconnect();
      return;
    }

    try {
      await this.messagesService.sendMessage(tenantId, agentId, dto);
    } catch (error) {
      this.logger.error(
        `Failed to send message for tenant ${tenantId}: ${(error as Error).message}`,
      );
    }
  }

  @SubscribeMessage(ConversationEvent.Read)
  @UseGuards(SocketAuthGuard)
  async handleConversationRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ): Promise<void> {
    const tenantId = client.data.session?.user?.tenantId as string | undefined;

    if (!tenantId) {
      this.logger.warn(`No tenantId for client ${client.id}, disconnecting`);
      client.disconnect();
      return;
    }

    try {
      const payload = await this.conversationsService.markAsRead(
        tenantId,
        data.conversationId,
      );

      this.emitToTenant(tenantId, ConversationEvent.Read, payload);
    } catch (error) {
      this.logger.error(
        `Failed to mark conversation ${data.conversationId} as read for tenant ${tenantId}: ${error.message}`,
      );
    }
  }

  /**
   * Emits an event to all clients in the tenant's room.
   * Used by services (e.g. MessagesService) to push real-time updates.
   */
  emitToTenant(
    tenantId: string,
    event: MessageEvent | ConversationEvent,
    data: unknown,
  ): void {
    this.server.to(tenantId).emit(event, data);
  }
}
