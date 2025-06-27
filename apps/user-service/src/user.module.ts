import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ClientAuthModule,
  ClientUserModule,
  loadAuthClientOptions,
  loadUserClientOptions,
  PermissionEntity,
  RequireConfirmationInterceptor,
  RoleEntity,
  ServiceJwtInterceptor,
  TwoFactorPermissionsEntity,
  UserClient,
  UserEntity,
  UserLoginMethodsEntity,
  UserRoleEntity,
} from '@merchant-outline/common';
import { ConfigModule, ConfigService } from '@merchant-outline/config';
import { DBModule } from '@merchant-outline/database';
import { AppLoggerModule, LoggingInterceptor } from '@merchant-outline/logger';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [
    ConfigModule,
    ClientUserModule.forRoot(loadUserClientOptions()),
    ClientAuthModule.forRoot(loadAuthClientOptions()),
    TypeOrmModule.forFeature([
      UserEntity,
      UserLoginMethodsEntity,
      RoleEntity,
      UserRoleEntity,
      PermissionEntity,
      TwoFactorPermissionsEntity,
    ]),
    DBModule.forRoot({
      entities: [
        UserEntity,
        UserLoginMethodsEntity,
        RoleEntity,
        UserRoleEntity,
        PermissionEntity,
        TwoFactorPermissionsEntity,
      ],
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
    }),
    AppLoggerModule,
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
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get().auth.service_secrets.user_service,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ServiceJwtInterceptor,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useFactory: (reflector: Reflector, userClient: UserClient) => {
    //     return new RequireConfirmationInterceptor(reflector, userClient);
    //   },
    //   inject: [Reflector, UserClient],
    // },
  ],
})
export class UserModule {}
