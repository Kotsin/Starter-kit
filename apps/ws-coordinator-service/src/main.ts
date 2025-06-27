// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { ConfigService } from '@merchant-outline/config';

import { CoordinatorModule } from './coordinator.module';

async function bootstrap(): Promise<void> {
  const configService = new ConfigService();

  configService.loadFromEnv();
  const coordinatorConfig = configService.get()
    .coordinatorService as RmqOptions;

  const app = await NestFactory.createMicroservice(
    CoordinatorModule,
    coordinatorConfig,
  );

  await app.listen();
}

bootstrap();
