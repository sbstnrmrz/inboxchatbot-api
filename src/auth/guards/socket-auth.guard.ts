import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { auth } from '../../lib/auth';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  private readonly logger = new Logger(SocketAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const session = await auth.api.getSession({
      headers: client.handshake.headers as any,
    });
    this.logger.debug('Socket auth headers')
    this.logger.debug(client.handshake.headers)

    if (!session) {
      throw new WsException('Unauthorized');
    }

    client.data.session = session;
    return true;
  }
}
