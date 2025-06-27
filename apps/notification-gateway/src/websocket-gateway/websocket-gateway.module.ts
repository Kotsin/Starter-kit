import { Module } from '@nestjs/common';
import { IOEmitterModule } from '@merchant-outline/io-emitter';
import { WebsocketGateway } from './websocket-gateway';
import { ConfigModule } from '@merchant-outline/config';

@Module({
  imports: [ConfigModule, IOEmitterModule],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketGatewayModule {}
