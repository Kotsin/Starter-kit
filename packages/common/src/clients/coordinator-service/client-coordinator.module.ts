import { DynamicModule } from '@nestjs/common';
import {
  ClientOptions,
  ClientProxyFactory,
  CustomClientOptions,
} from '@nestjs/microservices';

import {
  COORDINATOR_INJECT_TOKEN,
  CoordinatorClient,
} from './client-coordinator';

class CoordinatorModule {}

export class ClientCoordinatorModule {
  static forRoot(options: ClientOptions | CustomClientOptions): DynamicModule {
    return {
      global: true,
      module: CoordinatorModule,
      providers: [
        CoordinatorClient,
        {
          provide: COORDINATOR_INJECT_TOKEN,
          useFactory: () => ClientProxyFactory.create(options),
        },
      ],
      exports: [CoordinatorClient],
    };
  }
}
