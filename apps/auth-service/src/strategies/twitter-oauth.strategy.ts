import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserClient } from '@crypton-nestjs-kit/common';
import { Strategy } from 'passport-twitter';

import { AUTH_ERROR_CODES, authErrorMessages } from '../errors';
import {
  IAuthResult,
  IAuthStrategy,
  IOAuthAuthCredentials,
} from '../interfaces/auth-strategy.interface';

@Injectable()
export class TwitterOAuthStrategy
  extends PassportStrategy(Strategy, 'twitter')
  implements IAuthStrategy
{
  constructor(
    private readonly configService: ConfigService,
    private readonly userClient: UserClient,
  ) {
    super({
      consumerKey: configService.get('oauth.twitter.consumerKey'),
      consumerSecret: configService.get('oauth.twitter.consumerSecret'),
      callbackURL: configService.get('oauth.twitter.callbackUrl'),
      includeEmail: true,
    });
  }

  async validate(
    token: string,
    tokenSecret: string,
    profile: any,
    // eslint-disable-next-line @typescript-eslint/ban-types
    done: Function,
  ) {
    const { id, displayName, emails } = profile;
    const user = {
      provider: 'twitter',
      providerId: id,
      email: emails?.[0]?.value,
      name: displayName,
      token,
    };

    done(null, user);
  }

  async validateOAuth(_credentials: IOAuthAuthCredentials): Promise<any> {
    try {
      // TODO: Реализовать реальную проверку токена через Twitter API
      return {
        status: false,
        message: authErrorMessages[AUTH_ERROR_CODES.INVALID_CREDENTIALS],
        error: 'Twitter OAuth authentication not fully implemented',
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
      // TODO: Реализовать реальную валидацию токена через Twitter API
      return {
        status: false,
        message: authErrorMessages[AUTH_ERROR_CODES.INVALID_TOKEN],
        error: 'Twitter OAuth token validation not implemented',
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

  authenticate(_credentials?: any, _traceId?: string): Promise<any> {
    // Не используется, фабрика вызывает validateOAuth
    return Promise.resolve();
  }
}
