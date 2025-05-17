import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@crypton-nestjs-kit/config';
import { ConfigDatabase } from '@crypton-nestjs-kit/config/build/config.interface';

import { DbConfig } from './db.interface';

@Module({})
export class DBModule {
  private static getConnectionOptions(
    config: ConfigService,
    dbConfig: DbConfig,
  ): TypeOrmModuleOptions & {
    seeds?: string[];
    factories?: string[];
  } {
    const dbData = config.get().db;

    if (!dbData) {
      throw Error('');
    }

    const connectionOptions = this.getConnectionOptionsPostgres(dbData);

    return {
      ...connectionOptions,
      entities: dbConfig.entities,
      migrations: dbConfig.migrations,
      seeds: dbConfig.seeds,
      factories: dbConfig.factories,
    };
  }

  private static getConnectionOptionsPostgres(
    dbData: ConfigDatabase,
  ): TypeOrmModuleOptions {
    const db: TypeOrmModuleOptions = {
      type: 'postgres',
      host: dbData.host,
      port: dbData.port,
      username: dbData.username,
      password: dbData.password,
      database: dbData.database,
      migrationsRun: dbData.migrationsRun,
      ssl: dbData.ssl,
      extra: {
        connectionLimit: 15000,
        max: 20,
        min: 1,
      },
      poolSize: 15000,
    };

    if (dbData.replication) {
      // @ts-ignore
      db['replication'] = {
        master: db,
        slaves: dbData.slaves,
      };
    }

    return {
      ...db,
      synchronize: true,
      logging: false,
      keepConnectionAlive: true,
    };
  }

  public static forRoot(dbConfig: DbConfig) {
    return {
      module: DBModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => {
            return DBModule.getConnectionOptions(configService, dbConfig);
          },
          inject: [ConfigService],
        }),
      ],
      controllers: [],
      providers: [],
      exports: [],
    };
  }
}
