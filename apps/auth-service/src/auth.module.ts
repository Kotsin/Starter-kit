import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ClientUserModule,
  loadUserClientOptions,
} from '@crypton-nestjs-kit/common';
import { ConfigModule, ConfigService } from '@crypton-nestjs-kit/config';
import { DBModule } from '@crypton-nestjs-kit/database';
import {
  AppLoggerModule,
  LoggingInterceptor,
} from '@crypton-nestjs-kit/logger';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

import { AuthController } from './auth.controller';
import { SessionEntity } from './entity/session.entity';
import { AuthService } from './services/auth.service';

@Module({
  imports: [
    ConfigModule,
    AppLoggerModule,
    ClientUserModule.forRoot(loadUserClientOptions()),
    TypeOrmModule.forFeature([SessionEntity]),
    DBModule.forRoot({
      entities: [SessionEntity],
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
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AuthModule {}
