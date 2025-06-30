import { Module } from '@nestjs/common';
import { IOEmitterModule } from '@crypton-nestjs-kit/io-emitter';
import { WebsocketGateway } from './websocket-gateway';
import { ConfigModule } from '@crypton-nestjs-kit/config';

@Module({
  imports: [ConfigModule, IOEmitterModule],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketGatewayModule {}
