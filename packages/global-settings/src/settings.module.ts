import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettingsEntity } from './settings.entity';
import { SettingService } from './settings.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([SettingsEntity])],
  controllers: [],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule {}
