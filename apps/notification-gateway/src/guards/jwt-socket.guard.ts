import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserClient } from '@crypton-nestjs-kit/common';
import { AuthClient } from '@crypton-nestjs-kit/common';
import { ConfigService } from '@crypton-nestjs-kit/config';
import { Socket } from 'socket.io';

@Injectable()
export class JwtSocketGuard implements CanActivate {
  constructor(
    private readonly authClient: AuthClient,
    private readonly userClient: UserClient,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.configService.get().under_maintenance === 'true') {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        data: null,
        errors: null,
      });
    }

    const socket: Socket = context.switchToWs().getClient<Socket>();
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization?.split(' ')[1] as string);

    if (!token) throw new UnauthorizedException();

    const userTokenInfo = await this.authClient.tokenVerify(
      {
        token,
        userAgent: '',
        userIp: '',
      },
      '123123',
    );

    if (!userTokenInfo.user.userId) throw new UnauthorizedException();

    const user_id = userTokenInfo.user.userId;

    const user = await this.userClient.getUserById({ user_id });

    if (!user) throw new UnauthorizedException();

    socket.user_id = user_id;

    return true;
  }
}
