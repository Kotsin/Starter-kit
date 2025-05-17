import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DEFAULT_SETTINGS } from './settings.default';
import { SettingsEntity } from './settings.entity';

@Injectable()
export class SettingService implements OnModuleInit {
  private readonly PULL_SETTINGS_INTERVAL = 5 * 60 * 1000;
  settings = DEFAULT_SETTINGS;

  constructor(
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.pull();

    setInterval(() => this.pull(), this.PULL_SETTINGS_INTERVAL);
  }

  private async pull(): Promise<void> {
    const databaseSettings = await this.settingsRepository.find();

    databaseSettings.forEach((setting) => {
      this.settings[setting.key] = setting.data;
    });
  }
}
