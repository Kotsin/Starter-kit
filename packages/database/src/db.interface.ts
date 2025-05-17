import { ConnectionOptions } from 'typeorm';

export interface DbConfig {
  entities: ConnectionOptions['entities'];
  migrations?: ConnectionOptions['migrations'];
  seeds?: string[];
  factories?: string[];
}
