import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqOptions, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { IResponse, Service, ServiceType } from '../../types';

export const COORDINATOR_INJECT_TOKEN = 'COORDINATOR_SERVICE';

export const loadCoordinatorClientOptions = (): RmqOptions => {
  const { env } = process;

  const BROKER_URL = env[`COORDINATOR_SERVICE_RMQ_URL`] as string;
  const BROKER_QUEUE = env[`COORDINATOR_SERVICE_RMQ_QUEUE`] as string;

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
export class CoordinatorClient {
  constructor(
    @Inject(COORDINATOR_INJECT_TOKEN)
    private readonly coordinatorClientProxy: ClientProxy,
  ) {}

  async registerService(
    request: IRegisterServiceRequest,
  ): Promise<IRegisterServiceResponse> {
    return firstValueFrom(
      this.coordinatorClientProxy.send(
        CoordinatorClientPatterns.REGISTER_SERVICE,
        request,
      ),
    );
  }

  async getService(request: IGetServiceRequest): Promise<IGetServiceResponse> {
    return firstValueFrom(
      this.coordinatorClientProxy.send(
        CoordinatorClientPatterns.GET_SERVICE,
        request,
      ),
    );
  }
}

export enum CoordinatorClientPatterns {
  REGISTER_SERVICE = 'register_service',
  GET_SERVICE = 'get_service',
}

export interface IRegisterServiceRequest {
  readonly url: string;
  readonly type: ServiceType;
  readonly load: number;
}

export type IRegisterServiceResponse = IResponse;

export interface IGetServiceRequest {
  readonly type: ServiceType;
}

export interface IGetServiceResponse extends IResponse {
  readonly data: {
    readonly service: Service | null;
  };
}
