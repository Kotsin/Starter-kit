export enum BatchOperationStatus {
  UNPROCESSED = 'UNPROCESSED',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export interface BatchOperation {
  readonly id: string;
  readonly operationType: any;
  readonly sql: string;
  readonly status: BatchOperationStatus;
  readonly error: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
