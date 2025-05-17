import { DynamicModule } from '@nestjs/common';
import {
  ClientOptions,
  ClientProxyFactory,
  CustomClientOptions,
} from '@nestjs/microservices';

import { AUTH_INJECT_TOKEN, AuthClient } from './auth.client';

class AuthModule {}

export class ClientAuthModule {
  static forRoot(options: ClientOptions | CustomClientOptions): DynamicModule {
    return {
      global: true,
      module: AuthModule,
      providers: [
        AuthClient,
        {
          provide: AUTH_INJECT_TOKEN,
          useFactory: () => ClientProxyFactory.create(options),
        },
      ],
      exports: [AuthClient],
    };
  }
}
