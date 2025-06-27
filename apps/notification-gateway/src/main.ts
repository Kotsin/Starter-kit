require('dotenv').config();
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { GatewayModule } from './gateway.module';
import { RedisIoAdapter } from './ws/redis-io.adapter';
import { CustomLoggerService } from '@merchant-outline/logger';

declare module 'socket.io' {
  export interface Socket {
    user_id?: string;
  }
}

async function bootstrap(): Promise<void> {
  const logger = new CustomLoggerService('NOTIFICATION-GATEWAY');
  const app = await NestFactory.create(GatewayModule, {});

  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // TODO: temp env
  const redisUrl = process.env.REDIS_URL;

  const redisIoAdapter = new RedisIoAdapter(app, {
    cors: { origin: '*' },
    path: `/api/socket.io`,
    transports: ['websocket'],
  });

  await redisIoAdapter.connectToRedis(redisUrl);
  app.useWebSocketAdapter(redisIoAdapter);

  // TODO: temp env
  await app.listen(process.env.NOTIFY_PORT);

  logger.log(`Service started with host ${await app.getUrl()}`);
}

bootstrap();
