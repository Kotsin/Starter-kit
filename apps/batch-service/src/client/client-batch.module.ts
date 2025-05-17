import { DynamicModule } from '@nestjs/common';
import {
  ClientOptions,
  ClientProxyFactory,
  CustomClientOptions,
} from '@nestjs/microservices';

import { BATCH_INJECT_TOKEN, BatchClient } from './client-batch';

class BatchModule {}

export class ClientBatchModule {
  static forRoot(options: ClientOptions | CustomClientOptions): DynamicModule {
    return {
      global: true,
      module: BatchModule,
      providers: [
        BatchClient,
        {
          provide: BATCH_INJECT_TOKEN,
          useFactory: () => ClientProxyFactory.create(options),
        },
      ],
      exports: [BatchClient],
    };
  }
}
