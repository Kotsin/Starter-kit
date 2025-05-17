import { DynamicModule } from '@nestjs/common';
import {
  ClientOptions,
  ClientProxyFactory,
  CustomClientOptions,
} from '@nestjs/microservices';

import { USER_INJECT_TOKEN, UserClient } from './client-user';

class UserModule {}

export class ClientUserModule {
  static forRoot(options: ClientOptions | CustomClientOptions): DynamicModule {
    return {
      global: true,
      module: UserModule,
      providers: [
        UserClient,
        {
          provide: USER_INJECT_TOKEN,
          useFactory: () => ClientProxyFactory.create(options),
        },
      ],
      exports: [UserClient],
    };
  }
}
