// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import { NestFactory } from '@nestjs/core';
import { RmqOptions } from '@nestjs/microservices';
import { ConfigService } from '@crypton-nestjs-kit/config';

import { AuthModule } from './auth.module';

async function bootstrap(): Promise<void> {
  const config_service = new ConfigService();

  config_service.loadFromEnv();
  const auth_config = config_service.get().authService as RmqOptions;

  const app = await NestFactory.createMicroservice(AuthModule, auth_config);

  await app.listen();
}

bootstrap();
