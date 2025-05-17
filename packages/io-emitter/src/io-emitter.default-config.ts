import { registerAs } from '@nestjs/config';

export const IOEmitterDefaultConfig = registerAs('io-emitter', () => {
  const { REDIS_URL } = process.env;

  return { redisUrl: REDIS_URL };
});
