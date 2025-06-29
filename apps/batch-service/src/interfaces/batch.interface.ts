import {
  BatchOperation,
  BatchOperationStatus,
  UserOperationTypeEnum,
} from '@merchant-outline/common';

export type ProcessOperations = Pick<
  BatchOperation,
  'id' | 'operationType' | 'sql' | 'createdAt'
>[];

export interface BatchOperationResultData {
  readonly user_operation_id: string;
}

export enum SettingsKey {
  BATCH_INSERT_OPERATION_INTERVAL = 'BATCH_INSERT_OPERATION_INTERVAL',
  BATCH_PROCESS_OPERATION_INTERVAL = 'BATCH_PROCESS_OPERATION_INTERVAL',
  BATCH_PROCESS_OPERATION_LIMIT = 'BATCH_PROCESS_OPERATION_LIMIT',
}

export type BatchOperationResultValue = {
  readonly success: BatchOperationResultData[];
  readonly failed: BatchOperationResultData[];
};

export type BatchOperationResult = Record<
  UserOperationTypeEnum,
  BatchOperationResultValue
>;

export interface UpdateBatchOperationStatus {
  readonly id: string;
  readonly created_at: string;
  readonly status: BatchOperationStatus;
  readonly error?: string;
}
