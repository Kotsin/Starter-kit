export enum BatchOperationStatus {
  UNPROCESSED = 'UNPROCESSED',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export interface BatchOperation {
  readonly id: string;
  readonly operation_type: any;
  readonly sql: string;
  readonly status: BatchOperationStatus;
  readonly error: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}
