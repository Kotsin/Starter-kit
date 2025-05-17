import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@crypton-nestjs-kit/config';

import { GatewayController } from './gateway.controller';
import {
  ClientAuthModule,
  ClientCoordinatorModule,
  ClientUserModule,
  loadAuthClientOptions,
  loadCoordinatorClientOptions,
  loadUserClientOptions,
} from '@crypton-nestjs-kit/common';
import { WebsocketGateway, WebsocketGatewayModule } from './websocket-gateway';
import { JwtSocketGuard } from './guards/jwt-socket.guard';
import { IOEmitterModule } from '@crypton-nestjs-kit/io-emitter';

@Module({
  imports: [
    ConfigModule,
    IOEmitterModule,
    WebsocketGatewayModule,
    ClientAuthModule.forRoot(loadAuthClientOptions()),
    ClientUserModule.forRoot(loadUserClientOptions()),
    ClientCoordinatorModule.forRoot(loadCoordinatorClientOptions()),
  ],
  controllers: [GatewayController],
  providers: [ConfigService, JwtSocketGuard, WebsocketGateway],
})
export class GatewayModule {}
