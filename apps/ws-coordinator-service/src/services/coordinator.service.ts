import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IGetServiceRequest,
  IGetServiceResponse,
  IRegisterServiceRequest,
  IRegisterServiceResponse,
  ServiceEntity,
  ServiceStatus,
} from '@merchant-outline/common';

@Injectable()
export class CoordinatorService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepository: Repository<ServiceEntity>,
  ) {}

  public async registerService(
    data: IRegisterServiceRequest,
  ): Promise<IRegisterServiceResponse> {
    try {
      const service = await this.serviceRepository.findOne({
        where: { url: data.url },
      });

      if (service) {
        service.load = data.load;
        service.status = ServiceStatus.ACTIVE;
        service.type = data.type;

        await this.serviceRepository.save(service);

        return {
          status: true,
          message: 'Service already registered, updated successfully',
        };
      }

      await this.serviceRepository.save({
        url: data.url,
        type: data.type,
        load: data.load,
        status: ServiceStatus.ACTIVE,
      });

      return {
        status: true,
        message: 'Service registered successfully',
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'Service registration failed',
      };
    }
  }

  public async getAllServices(): Promise<{
    status: boolean;
    message: string;
    data: {
      services: ServiceEntity[];
    };
    error?: string;
  }> {
    try {
      const services = await this.serviceRepository.find();

      return {
        status: true,
        message: 'Get active services successfully',
        data: {
          services,
        },
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'Get active services failed',
        data: {
          services: [],
        },
      };
    }
  }

  public async getActiveServices(): Promise<{
    status: boolean;
    message: string;
    data: {
      services: ServiceEntity[];
    };
    error?: string;
  }> {
    try {
      const services = await this.serviceRepository.find({
        where: {
          status: ServiceStatus.ACTIVE,
        },
      });

      return {
        status: true,
        message: 'Get active services successfully',
        data: {
          services,
        },
      };
    } catch (e) {
      return {
        error: e.message,
        status: false,
        message: 'Get active services failed',
        data: {
          services: [],
        },
      };
    }
  }

  public async updateServiceStatusById(
    id: string,
    status: ServiceStatus,
  ): Promise<void> {
    await this.serviceRepository.update({ id }, { status });
  }

  public async updateServiceLoadById(
    id: string,
    load: number,
    status: ServiceStatus,
  ): Promise<void> {
    await this.serviceRepository.update({ id }, { load, status });
  }

  public async getLeastLoadedService(
    data: IGetServiceRequest,
  ): Promise<IGetServiceResponse> {
    try {
      const { type } = data;

      const activeServices = await this.serviceRepository.find({
        where: { status: ServiceStatus.ACTIVE, type },
        order: { load: 'ASC' },
      });

      if (activeServices.length === 0) {
        return {
          data: { service: null },
          message: 'No active service available',
          status: true,
        };
      }

      return {
        data: { service: activeServices[0] },
        message: 'Service found',
        status: true,
      };
    } catch (e) {
      return {
        error: e.message,
        data: { service: null },
        message: 'Get least loaded service failed',
        status: false,
      };
    }
  }
}
