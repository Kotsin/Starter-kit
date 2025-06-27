import { Injectable, OnModuleInit } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { CoordinatorService } from './coordinator.service';
import { ServiceStatus } from '@merchant-outline/common';

@Injectable()
export class CoordinatorWorker implements OnModuleInit {
  #HEALTH_CHECK_INTERVAL = 20 * 1000;
  #SERVICE_RESPONSE_TIMEOUT = 5 * 1000;
  constructor(private readonly coordinatorService: CoordinatorService) {}

  onModuleInit() {
    setInterval(async () => {
      this.#healthCheck();
    }, this.#HEALTH_CHECK_INTERVAL);
  }

  async #healthCheck() {
    const services = (await this.coordinatorService.getAllServices()).data
      .services;

    const promises = services.map((service) =>
      axios
        .get(`${service.url}/health`, {
          timeout: this.#SERVICE_RESPONSE_TIMEOUT,
        })
        .then((response: AxiosResponse) => ({
          status: 'fulfilled',
          serviceId: service.id,
          data: response.data,
        }))
        .catch(() => ({
          status: 'rejected',
          serviceId: service.id,
        })),
    );

    const responses = (await Promise.allSettled(promises)) as {
      value: {
        serviceId: string;
        status: 'fulfilled' | 'rejected';
        data: { load: number };
      };
    }[];

    for (const response of responses) {
      const serviceId = response.value.serviceId;
      const status = response.value.status;

      if (status === 'rejected') {
        this.coordinatorService.updateServiceStatusById(
          serviceId,
          ServiceStatus.INACTIVE,
        );
      }

      if (status === 'fulfilled') {
        const load = response.value.data.load;
        this.coordinatorService.updateServiceLoadById(
          serviceId,
          load,
          ServiceStatus.ACTIVE,
        );
      }
    }
  }
}
