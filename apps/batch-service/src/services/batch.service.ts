import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BatchOperationStatus,
  ICreateBatchOperationRequest,
  ICreateBatchOperationResponse,
  IGetBatchOperationRequest,
  IGetBatchOperationResponse,
  OperationEntity,
} from '@merchant-outline/common';
import { CustomLoggerService } from '@merchant-outline/logger';
import { SettingService } from '@merchant-outline/settings';
import { Repository } from 'typeorm';

import { BATCH_CONNECTION_NAME } from './batch.constants';

@Injectable()
export class BatchService implements OnModuleInit, OnApplicationShutdown {
  private batchTimeToUpdate = Date.now();
  private readonly batchTransactions: Map<
    string,
    Pick<OperationEntity, 'id' | 'operationType' | 'sql' | 'status'>
  > = new Map();

  constructor(
    @InjectRepository(OperationEntity, BATCH_CONNECTION_NAME)
    private readonly operationRepository: Repository<OperationEntity>,
    private readonly settingsService: SettingService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext(BatchService.name);
  }

  async onModuleInit(): Promise<void> {
    try {
      setInterval(
        () => this.#batchInsertOperation(),
        this.BATCH_INSERT_OPERATION_INTERVAL,
      );
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  async onApplicationShutdown(): Promise<any> {
    try {
      this.logger.log('batchInsertBalances Shutting Down');
      await this.#batchInsertOperation();
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  async createOperation(
    request: ICreateBatchOperationRequest,
  ): Promise<ICreateBatchOperationResponse> {
    try {
      this.batchTransactions.set(`${request.userOperationId}`, {
        id: request.userOperationId,
        operationType: request.operationType,
        sql: request.sql,
        status: BatchOperationStatus.UNPROCESSED,
      });

      return {
        status: true,
        message: 'Create operation success',
      };
    } catch (e) {
      this.logger.error(e.message);

      return {
        error: e.message,
        status: false,
        message: 'Create operation failed',
      };
    }
  }

  async getOperation(
    request: IGetBatchOperationRequest,
  ): Promise<IGetBatchOperationResponse> {
    try {
      const operation = await this.operationRepository.findOne({
        where: { id: request.id },
      });

      if (!operation) {
        return {
          message: 'Get operation failed',
          error: 'Operation not found',
          status: false,
          data: null,
        };
      }

      return {
        message: 'Get operation success',
        status: true,
        data: operation as unknown as IGetBatchOperationResponse['data'],
      };
    } catch (e) {
      this.logger.error(e.message);

      return {
        message: 'Get operation failed',
        error: e.message,
        status: false,
        data: null,
      };
    }
  }

  #batchInsertOperation(): Promise<void> {
    try {
      if (
        Date.now() - this.batchTimeToUpdate >
        this.BATCH_INSERT_OPERATION_INTERVAL
      ) {
        if (this.batchTransactions.size === 0) return;

        const values = Array.from(this.batchTransactions.values());

        this.batchTransactions.clear();

        this.operationRepository
          .createQueryBuilder()
          .insert()
          .values(values)
          .orIgnore('id')
          .execute();

        this.batchTimeToUpdate = Date.now();
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  get BATCH_INSERT_OPERATION_INTERVAL(): number {
    return this.settingsService.settings.BATCH_INSERT_OPERATION_INTERVAL;
  }
}
