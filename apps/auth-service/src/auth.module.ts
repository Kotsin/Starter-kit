import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApiKeyEntity,
  ClientUserModule,
  loadUserClientOptions,
  SessionEntity,
} from '@merchant-outline/common';
import { ConfigModule, ConfigService } from '@merchant-outline/config';
import { DBModule } from '@merchant-outline/database';
import { AppLoggerModule, LoggingInterceptor } from '@merchant-outline/logger';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

import { ApiKeyController } from './controllers/api-key.controller';
import { AuthController } from './controllers/auth.controller';
import { ApiKeyService } from './services/api-key/api-key.service';
import { AuthService } from './services/auth/auth.service';
import { AuthStrategyFactory } from './services/auth/auth-strategy-factory.service';
// Стратегии
import { NativeStrategy } from './services/auth/strategies/native.strategy';
import { ServiceJwtUseCase } from './use-cases/service-jwt.use-case';

@Module({
  imports: [
    ConfigModule,
    AppLoggerModule,
    ClientUserModule.forRoot(loadUserClientOptions()),
    TypeOrmModule.forFeature([SessionEntity, ApiKeyEntity]),
    DBModule.forRoot({
      entities: [SessionEntity, ApiKeyEntity],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get().auth.token_secret,
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: async (configService: ConfigService) => {
        const redis = configService.get().redisCache;

        return {
          store: redisStore,
          url: redis.url,
        } as RedisClientOptions;
      },
    }),
  ],
  controllers: [AuthController, ApiKeyController],
  providers: [
    AuthStrategyFactory,
    AuthService,
    ApiKeyService,
    // Стратегии
    NativeStrategy,
    // Use cases
    ServiceJwtUseCase,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AuthModule {}
