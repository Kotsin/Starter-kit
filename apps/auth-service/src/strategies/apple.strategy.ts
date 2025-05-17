import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy<any>(Strategy, 'apple') {
  constructor(private readonly configService: ConfigService) {
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
}
