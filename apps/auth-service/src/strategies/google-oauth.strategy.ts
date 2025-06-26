import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserClient } from '@crypton-nestjs-kit/common';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

import { AUTH_ERROR_CODES, authErrorMessages } from '../errors';
import {
  IAuthResult,
  IAuthStrategy,
  IOAuthAuthCredentials,
} from '../interfaces/auth-strategy.interface';

@Injectable()
export class GoogleOAuthStrategy
  extends PassportStrategy(Strategy, 'google')
  implements IAuthStrategy
{
  constructor(
    private readonly configService: ConfigService,
    private readonly userClient: UserClient,
  ) {
    super({
      clientID: configService.get('oauth.google.clientId'),
      clientSecret: configService.get('oauth.google.clientSecret'),
      callbackURL: configService.get('oauth.google.callbackUrl'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { id, displayName, emails } = profile;
    const user = {
      provider: 'google',
      providerId: id,
      email: emails?.[0]?.value,
      name: displayName,
      accessToken,
    };

    done(null, user);
  }

  async validateOAuth(credentials: IOAuthAuthCredentials): Promise<any> {
    try {
      // TODO: Реализовать реальную проверку токена через Google API
      return {
        status: false,
        message: authErrorMessages[AUTH_ERROR_CODES.INVALID_CREDENTIALS],
        error: 'Google OAuth authentication not fully implemented',
        errorCode: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      };
    } catch (error) {
      return {
        status: false,
        message: authErrorMessages[AUTH_ERROR_CODES.UNKNOWN_ERROR],
        error: error.message,
        errorCode: AUTH_ERROR_CODES.UNKNOWN_ERROR,
      };
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      // TODO: Реализовать реальную валидацию токена через Google API
      return {
        status: false,
        message: authErrorMessages[AUTH_ERROR_CODES.INVALID_TOKEN],
        error: 'Google OAuth token validation not implemented',
        errorCode: AUTH_ERROR_CODES.INVALID_TOKEN,
      };
    } catch (error) {
      return {
        status: false,
        message: authErrorMessages[AUTH_ERROR_CODES.UNKNOWN_ERROR],
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
