import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ClientAuthModule,
  ClientPermissionModule,
  ClientUserModule,
  loadAuthClientOptions,
  loadPermissionClientOptions,
  loadUserClientOptions,
  PermissionEntity,
  PermissionsRegistrarModule,
  RequireConfirmationInterceptor,
  RoleEntity,
  ServiceJwtInterceptor,
  TwoFactorPermissionsEntity,
  UserClient,
  UserEntity,
  UserLoginMethodsEntity,
  UserRoleEntity,
} from '@crypton-nestjs-kit/common';
import { ConfigModule, ConfigService } from '@crypton-nestjs-kit/config';
import { DBModule } from '@crypton-nestjs-kit/database';
import {
  AppLoggerModule,
  LoggingInterceptor,
} from '@crypton-nestjs-kit/logger';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [
    ConfigModule,
    ClientAuthModule.forRoot(loadAuthClientOptions()),
    ClientPermissionModule.forRoot(loadPermissionClientOptions()),
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
          secret: configService.get().auth.service_secrets.default,
        };
      },
      inject: [ConfigService],
    }),
    PermissionsRegistrarModule,
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
