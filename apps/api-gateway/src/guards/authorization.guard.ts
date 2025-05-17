import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthClient } from '@crypton-nestjs-kit/common';
import { ConfigService } from '@crypton-nestjs-kit/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authClient: AuthClient,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const secured = this.reflector.get<string[]>(
      'secured',
      context.getHandler(),
    );

    if (!secured) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new UnauthorizedException({
        message: 'Unauthorized',
        data: null,
        errors: null,
      });
    }

    const data = {
      token: request.headers.authorization.split(' ')[1],
      userAgent: request.headers['user-agent'] || '',
      userIp: request.headers['x-forwarded-for'] || request.headers.host,
      fingerprint: request.headers['fingerprint'] || '',
      country: request.headers['cf-ipcountry'] || '',
      city: request.headers['cf-ipcity'] || '',
    };

    const tokenInfo = await this.authClient.tokenVerify(
      data,
      request['correlationId'],
      true,
    );

    if (!tokenInfo.status) {
      throw new UnauthorizedException({
        message: tokenInfo.message,
        data: null,
        errors: null,
      });
    }

    request.user = tokenInfo.user;

    return true;
  }
}
