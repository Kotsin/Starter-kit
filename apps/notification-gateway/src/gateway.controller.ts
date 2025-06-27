import { Controller, Get, OnModuleInit } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CoordinatorClient, ServiceType } from '@merchant-outline/common';
import { ConfigService } from '@merchant-outline/config';
import { WebsocketGateway } from './websocket-gateway';

@Controller('/health')
export class GatewayController implements OnModuleInit {
  constructor(
    private websocketGateway: WebsocketGateway,
    private coordinatorClient: CoordinatorClient,
  ) {}

  onModuleInit() {
    this.coordinatorClient.registerService({
      // TODO: temp solution
      url: process.env.SELF_DOMAIN,
      type: ServiceType.NOTIFICATION,
      load: this.websocketGateway.getConnectionsCount(),
    });
  }

  @ApiOkResponse({ description: 'Returns the number of connections' })
  @ApiTags('health')
  @Get()
  check() {
    return { load: this.websocketGateway.getConnectionsCount() };
  }
}
