import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { auth } from '../../lib/auth';
import { Session } from 'better-auth';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  private readonly logger = new Logger(SocketAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
 // this.logger.debug('Socket handshake');
 // this.logger.debug(client.handshake);

    const session = await auth.api.getSession({ headers: client.handshake.headers as any });

    if (!session) {
      throw new WsException('Unauthorized');
    }

    client.data.session = session;
    return true;
  }
}
