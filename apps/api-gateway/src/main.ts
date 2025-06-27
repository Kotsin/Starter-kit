// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@merchant-outline/config';
import { CustomLoggerService } from '@merchant-outline/logger';

import { GatewayModule } from './gateway.module';

async function bootstrap(): Promise<void> {
  const logger = new CustomLoggerService('API-GATEWAY');
  const configService = new ConfigService();
  const prefix = 'api';
  const app = await NestFactory.create(GatewayModule, {
    cors: {
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
  });

  const server = app.getHttpServer();

  server.keepAliveTimeout = 30000;
  server.headersTimeout = 31000;

  configService.loadFromEnv();

  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix(prefix);

  if (configService.get().env !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('API docs')
      .addBearerAuth()
      .setVersion('1.0')
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-api-key',
          'x-tokenName': 'x-api-key',
          in: 'header',
        },
        'api-key-header',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'apiKey',
          in: 'query',
        },
        'api-key-query',
      )
      .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('docs', app, document, {
      useGlobalPrefix: true,
      swaggerOptions: { tagsSorter: 'alpha' },
    });
  }

  await app.listen(Number(configService.get().port), configService.get().host);

  console.log(`Service started with host ${await app.getUrl()}/${prefix}`);
}

bootstrap();
