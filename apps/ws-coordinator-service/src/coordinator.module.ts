import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@crypton-nestjs-kit/config';
import { DBModule } from '@crypton-nestjs-kit/database';

import { ServiceEntity } from './entity/service.entity';
import { CoordinatorController } from './controller/coordinator.controller';
import { CoordinatorService } from './services/coordinator.service';
import { CoordinatorWorker } from './services/coordinator.worker';

@Module({
  imports: [
    ConfigModule,
    DBModule.forRoot({ entities: [ServiceEntity] }),
    TypeOrmModule.forFeature([ServiceEntity]),
  ],
  controllers: [CoordinatorController],
  providers: [CoordinatorService, CoordinatorWorker],
})
export class CoordinatorModule {}
