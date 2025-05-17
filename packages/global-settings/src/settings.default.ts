import { Settings } from './settings.interface';

export const DEFAULT_SETTINGS: Record<Settings, any> = {
  BATCH_PROCESS_OPERATION_INTERVAL: 400,
  BATCH_PROCESS_OPERATION_LIMIT: 400,
  BATCH_INSERT_OPERATION_INTERVAL: 100,
};
