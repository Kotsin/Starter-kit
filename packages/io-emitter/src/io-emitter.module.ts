import { Module } from '@nestjs/common';
import { IO_EMITTER_REDIS_CLIENT } from './io-emitter.constants.js';
import { IOEmitter } from './io-emitter.js';
import { IOEmitterRedis } from './io-emitter.redis.js';
import { createClient } from 'redis';
import { ConfigModule } from '@nestjs/config';
import { IOEmitterDefaultConfig } from './io-emitter.default-config.js';

@Module({
  imports: [ConfigModule.forFeature(IOEmitterDefaultConfig)],
  providers: [
    { provide: IOEmitter, useExisting: IOEmitterRedis },
    {
      provide: IO_EMITTER_REDIS_CLIENT,
      inject: [IOEmitterDefaultConfig.KEY],
      useFactory: async () => await connectRedis(),
    },
    IOEmitterRedis,
  ],
  exports: [IOEmitter],
})
export class IOEmitterModule {}

async function connectRedis() {
  const url = process.env.REDIS_URL;
  return createClient({ url }).connect();
}
