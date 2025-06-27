require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { ConfigService } from '@merchant-outline/config';

import { BatchModule } from './batch.module';

async function bootstrap(): Promise<void> {
  const configService = new ConfigService();

  configService.loadFromEnv();
  const amqp = configService.get().batchService.amqp as RmqOptions;
  const app = await NestFactory.createMicroservice(BatchModule, amqp);

  app.enableShutdownHooks();

  await app.listen();
}

bootstrap();
