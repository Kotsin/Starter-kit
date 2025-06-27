import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@merchant-outline/config';

import { GatewayController } from './gateway.controller';
import {
  ClientAuthModule,
  ClientCoordinatorModule,
  ClientUserModule,
  loadAuthClientOptions,
  loadCoordinatorClientOptions,
  loadUserClientOptions,
} from '@merchant-outline/common';
import { WebsocketGateway, WebsocketGatewayModule } from './websocket-gateway';
import { JwtSocketGuard } from './guards/jwt-socket.guard';
import { IOEmitterModule } from '@merchant-outline/io-emitter';

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
