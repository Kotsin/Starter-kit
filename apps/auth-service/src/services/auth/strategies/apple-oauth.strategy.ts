import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  AUTH_ERROR_CODES,
  AuthErrorMessages,
  IAuthStrategy,
  IOAuthAuthCredentials,
  UserClient,
} from '@crypton-nestjs-kit/common';
import { Strategy } from 'passport-apple';

@Injectable()
export class AppleOAuthStrategy
  extends PassportStrategy<any>(Strategy, 'apple')
  implements IAuthStrategy
{
  constructor(
    private readonly configService: ConfigService,
    private readonly userClient: UserClient,
  ) {
    super({
      clientID: configService.get('oauth.apple.clientId'),
      teamID: configService.get('oauth.apple.teamId'),
      keyID: configService.get('oauth.apple.keyId'),
      callbackURL: configService.get('oauth.apple.callbackUrl'),
      scope: ['email', 'name'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    idToken: any,
    profile: any,
    // eslint-disable-next-line @typescript-eslint/ban-types
    done: Function,
  ) {
    const user = {
      provider: 'apple',
      providerId: profile.id,
      email: profile.email,
      name: profile.name,
      accessToken,
    };

    done(null, user);
  }

  async validateOAuth(credentials: IOAuthAuthCredentials): Promise<any> {
    try {
      // TODO: Реализовать реальную проверку токена через Apple API
      return {
        status: false,
        message: AuthErrorMessages[AUTH_ERROR_CODES.INVALID_CREDENTIALS],
        error: 'Apple OAuth authentication not fully implemented',
        errorCode: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      };
    } catch (error) {
      return {
        status: false,
        message: AuthErrorMessages[AUTH_ERROR_CODES.UNKNOWN_ERROR],
        error: error.message,
        errorCode: AUTH_ERROR_CODES.UNKNOWN_ERROR,
      };
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      // TODO: Реализовать реальную валидацию токена через Apple API
      return {
        status: false,
        message: AuthErrorMessages[AUTH_ERROR_CODES.INVALID_TOKEN],
        error: 'Apple OAuth token validation not implemented',
        errorCode: AUTH_ERROR_CODES.INVALID_TOKEN,
      };
    } catch (error) {
      return {
        status: false,
        message: AuthErrorMessages[AUTH_ERROR_CODES.UNKNOWN_ERROR],
        error: error.message,
        errorCode: AUTH_ERROR_CODES.UNKNOWN_ERROR,
      };
    }
  }

  // Для совместимости с интерфейсом IAuthStrategy и PassportStrategy
  authenticate(_credentials?: any, _traceId?: string): Promise<any> {
    // Не используется, фабрика вызывает validateOAuth
    return Promise.resolve();
  }
}
