import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from './enums/socket-events.enum';
import { Logger, UseGuards } from '@nestjs/common';
import { MessageEvent } from './enums/message-events.enum';
import { SocketAuthGuard } from 'src/auth/guards/socket-auth.guard';
import { ConfigService } from '@nestjs/config';

// TODO: when production config origin
@WebSocketGateway({
  path: '/socket',
  cors: {
    origin: process.env.FRONTEND_URL,
  }
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  @UseGuards(SocketAuthGuard)
  @SubscribeMessage(SocketEvent.Connect)
  async handleConnection(client: Socket, payload: any) {
    try {
      this.logger.debug(`Socket client ${client.id} connected`);
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
