import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ApiKeyEntity,
  ClientPermissionModule,
  ClientUserModule,
  InvitationEntity,
  loadPermissionClientOptions,
  loadUserClientOptions,
  PermissionsRegistrarModule,
  RequireConfirmationInterceptor,
  ServiceJwtGenerator,
  ServiceJwtInterceptor,
  SessionEntity,
  UserClient,
} from '@crypton-nestjs-kit/common';
import { ConfigModule, ConfigService } from '@crypton-nestjs-kit/config';
import { DBModule } from '@crypton-nestjs-kit/database';
import {
  AppLoggerModule,
  LoggingInterceptor,
} from '@crypton-nestjs-kit/logger';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

import { ApiKeyController } from './controllers/api-key.controller';
import { AuthController } from './controllers/auth.controller';
import { InvitationController } from './controllers/invitation.controller';
import { ApiKeyService } from './services/api-key/api-key.service';
import { AuthService } from './services/auth/auth.service';
import { AuthStrategyFactory } from './services/auth/auth-strategy-factory.service';
// Стратегии
import { NativeStrategy } from './services/auth/strategies/native.strategy';
import { InvitationService } from './services/invitation/invitation.service';

@Module({
  imports: [
    PermissionsRegistrarModule,
    ConfigModule,
    AppLoggerModule,
    ClientUserModule.forRoot(loadUserClientOptions()),
    ClientPermissionModule.forRoot(loadPermissionClientOptions()),
    TypeOrmModule.forFeature([SessionEntity, ApiKeyEntity, InvitationEntity]),
    DBModule.forRoot({
      entities: [SessionEntity, ApiKeyEntity, InvitationEntity],
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
  controllers: [AuthController, ApiKeyController, InvitationController],
  providers: [
    AuthStrategyFactory,
    AuthService,
    ApiKeyService,
    InvitationService,
    // Strategy's
    NativeStrategy,
    // Use cases
    ServiceJwtGenerator,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ServiceJwtInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector, userClient: UserClient) => {
        return new RequireConfirmationInterceptor(reflector, userClient);
      },
      inject: [Reflector, UserClient],
    },
  ],
})
export class AuthModule {}
