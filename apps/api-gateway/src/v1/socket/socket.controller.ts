import { Controller, Get, NotFoundException } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CoordinatorClient, ServiceType } from '@merchant-outline/common';

import { Authorization } from '../../decorators/authorization.decorator';

import { GetSocketConnectionResponseDto } from './dto/socket.dto';

@Controller('v1/sockets')
export class SocketController {
  constructor(private readonly coordinatorClient: CoordinatorClient) {}

  @ApiResponse({
    status: 200,
    description: 'Get socket connection',
    type: GetSocketConnectionResponseDto,
  })
  @ApiBearerAuth()
  @ApiTags('Sockets')
  @ApiOperation({ summary: 'Get socket connection' })
  @Authorization(true)
  @Get()
  async getSocketConnection(): Promise<GetSocketConnectionResponseDto> {
    const coordinatorData = await this.coordinatorClient.getService({
      type: ServiceType.NOTIFICATION,
    });

    if (!coordinatorData.status) {
      throw new NotFoundException('Socket connection not found');
    }

    return {
      message: coordinatorData.message,
      status: coordinatorData.status,
      connection: coordinatorData?.data?.service?.url || null,
    };
  }
}
