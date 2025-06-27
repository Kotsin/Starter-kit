import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

import { CoordinatorService } from '../services/coordinator.service';
import {
  CoordinatorClientPatterns,
  IGetServiceRequest,
  IGetServiceResponse,
  IRegisterServiceRequest,
  IRegisterServiceResponse,
} from '@merchant-outline/common';

@Controller('coordinator')
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @MessagePattern(CoordinatorClientPatterns.REGISTER_SERVICE)
  public async registerService(
    data: IRegisterServiceRequest,
  ): Promise<IRegisterServiceResponse> {
    return await this.coordinatorService.registerService(data);
  }

  @MessagePattern(CoordinatorClientPatterns.GET_SERVICE)
  public async getService(
    data: IGetServiceRequest,
  ): Promise<IGetServiceResponse> {
    return await this.coordinatorService.getLeastLoadedService(data);
  }
}
