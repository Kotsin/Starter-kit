import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@merchant-outline/config';
import { DBModule } from '@merchant-outline/database';

import { CoordinatorController } from './controller/coordinator.controller';
import { CoordinatorService } from './services/coordinator.service';
import { CoordinatorWorker } from './services/coordinator.worker';
import { ServiceEntity } from '@merchant-outline/common';

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
