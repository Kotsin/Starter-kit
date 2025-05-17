import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BatchOperationStatus } from '@crypton-nestjs-kit/common';
import { CustomLoggerService } from '@crypton-nestjs-kit/logger';
import { In, Repository } from 'typeorm';

import { OperationEntity } from '../entities/operation.entity';
import {
  ProcessOperations,
  UpdateBatchOperationStatus,
} from '../interfaces/batch.interface';
import { BATCH_CONNECTION_NAME } from './batch.constants';

@Injectable()
export class WorkerService {
  constructor(
    @InjectRepository(OperationEntity, BATCH_CONNECTION_NAME)
    private readonly operationRepository: Repository<OperationEntity>,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext(WorkerService.name);
  }

  async getProcessOperations(data: {
    limit: number;
  }): Promise<ProcessOperations> {
    try {
      // TODO: index: status, created_at
      const result = (await this.operationRepository.find({
        select: ['id', 'operation_type', 'sql', 'created_at'],
        where: { status: BatchOperationStatus.UNPROCESSED },
        order: { created_at: 'ASC' },
        take: data.limit,
      })) as unknown as ProcessOperations;

      return result;
    } catch (e) {
      this.logger.error(e.message, 'getProcessOperations');

      return [];
    }
  }

  async setProcessOperationsStatus(data: { ids: string[] }): Promise<boolean> {
    try {
      await this.operationRepository.update(
        { id: In(data.ids) },
        { status: BatchOperationStatus.PROCESSING },
      );

      return true;
    } catch (e) {
      this.logger.error(e.message, 'setProcessOperationsStatus');

      return false;
    }
  }

  async updateBatchOperationStatus(
    data: UpdateBatchOperationStatus[],
  ): Promise<boolean> {
    try {
      const queries = data
        .map(
          ({ id, status, error }) =>
            `UPDATE "BatchOperation" SET 
              status = '${status}', 
              error = '${error || ''}'
              WHERE id = '${id}';`,
        )
        .join(' ');

      await this.operationRepository.query(`BEGIN; ${queries} COMMIT;`);

      return true;
    } catch (e) {
      this.logger.error(e.message, 'updateBatchOperationStatus');

      return false;
    }
  }
}
