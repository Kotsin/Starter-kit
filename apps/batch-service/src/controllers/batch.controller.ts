import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  BatchClientPatterns,
  ICreateBatchOperationRequest,
  ICreateBatchOperationResponse,
  IGetBatchOperationRequest,
  IGetBatchOperationResponse,
} from '@crypton-nestjs-kit/common';

import { BatchService } from '../services/batch.service';

@Controller('batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @MessagePattern(BatchClientPatterns.GET_OPERATION)
  async getBatchOperation(
    request: IGetBatchOperationRequest,
  ): Promise<IGetBatchOperationResponse> {
    return this.batchService.getOperation(request);
  }

  @MessagePattern(BatchClientPatterns.CREATE_OPERATION)
  async createBatchOperation(
    request: ICreateBatchOperationRequest,
  ): Promise<ICreateBatchOperationResponse> {
    return this.batchService.createOperation(request);
  }
}
