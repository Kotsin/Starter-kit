import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqOptions, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { BatchOperation, IResponse } from '../../interfaces';

export const BATCH_INJECT_TOKEN = 'BATCH_SERVICE';

export const loadBatchClientOptions = (): RmqOptions => {
  const { env } = process;

  const BROKER_URL = env[`BATCH_SERVICE_RMQ_URL`] as string;
  const BROKER_QUEUE = env[`BATCH_SERVICE_RMQ_QUEUE`] as string;

  return {
    transport: Transport.RMQ,
    options: {
      urls: [BROKER_URL],
      queue: BROKER_QUEUE,
      queueOptions: {
        durable: false,
      },
    },
  };
};

@Injectable()
export class BatchClient {
  constructor(
    @Inject(BATCH_INJECT_TOKEN)
    private readonly batchClientProxy: ClientProxy,
  ) {}

  async getOperation(
    request: IGetBatchOperationRequest,
  ): Promise<IGetBatchOperationResponse> {
    return firstValueFrom(
      this.batchClientProxy.send(BatchClientPatterns.GET_OPERATION, request),
    );
  }

  async createOperation(
    request: ICreateBatchOperationRequest,
  ): Promise<ICreateBatchOperationResponse> {
    return firstValueFrom(
      this.batchClientProxy.emit(BatchClientPatterns.CREATE_OPERATION, request),
    );
  }
}

export enum BatchClientPatterns {
  GET_OPERATION = 'get_operation',
  CREATE_OPERATION = 'create_operation',
}

export type IGetBatchOperationRequest = Pick<BatchOperation, 'id'>;

export type IGetBatchOperationData = BatchOperation;

export interface IGetBatchOperationResponse extends IResponse {
  readonly data: IGetBatchOperationData;
}

export interface ICreateBatchOperationRequest
  extends Pick<BatchOperation, 'operationType' | 'sql'> {
  readonly userOperationId: string;
}

export type ICreateBatchOperationResponse = IResponse;
