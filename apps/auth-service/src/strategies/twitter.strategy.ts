// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-twitter';
//
// @Injectable()
// export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
//   constructor(private readonly configService: ConfigService) {
//     super({
//       consumerKey: configService.get('oauth.twitter.consumerKey'),
//       consumerSecret: configService.get('oauth.twitter.consumerSecret'),
//       callbackURL: configService.get(),
//       includeEmail: true,
//     });
//   }
//
//   async validate(
//     token: string,
//     tokenSecret: string,
//     profile: any,
//     done: Function,
//   ) {
//     const { id, displayName, emails } = profile;
//     const user = {
//       provider: 'twitter',
//       providerId: id,
//       email: emails?.[0]?.value,
//       name: displayName,
//       token,
//     };
//
//     done(null, user);
//   }
// }
