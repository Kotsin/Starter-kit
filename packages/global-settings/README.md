### Документация по работе с `SettingService`

`SettingService` обновляет переменные каждые 5 минут, извлекая актуальные значения из таблицы `Settings` в базе данных PostgreSQL.

---

## Добавление новой переменной

Чтобы добавить новую переменную, выполните следующие шаги:

1. **Обновите перечисление `Settings` в файле `settings.interface.ts`.**
2. **Установите значение по умолчанию в `settings.default.ts`.**
3. **Добавьте переменную в таблицу `Settings` в базе данных и задайте ей значение.**  
   Если переменная отсутствует в БД, будет использовано значение по умолчанию.

---

## Подключение `SettingModule` в сервис

Чтобы интегрировать `SettingModule` в сервис, выполните следующие действия:

1. Установите пакет:

   ```
   pnpm i @crypton-nestjs-kit/settings
   ```

2. Добавьте `SettingModule` в `imports` корневого модуля.
3. Обновите массив `TypeOrmModule.forFeature`, добавив в него `SettingsEntity`.
4. Обновите массив `DBModule.forRoot`, добавив `SettingsEntity`.

### Пример подключения модуля:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DBModule } from '@crypton-nestjs-kit/database';
import { SettingModule, SettingsEntity } from '@crypton-nestjs-kit/settings';

@Module({
  imports: [
    SettingModule,
    TypeOrmModule.forFeature([SettingsEntity]),
    DBModule.forRoot({ entities: [SettingsEntity] }),
  ],
  controllers: [],
  providers: [],
})
export class SomeModule {}
```

---

## Использование `SettingService` для получения переменных

Чтобы использовать `SettingService` и получить переменные:

1. Импортируйте `SettingService`:

   ```ts
   import { SettingService } from '@crypton-nestjs-kit/settings';
   ```

2. Объявите `settingsService` в классе:

   ```ts
   private readonly settingsService: SettingService;
   ```

3. Получите переменную через `settings`:

   ```ts
   this.settingsService.settings.BATCH_INSERT_OPERATION_INTERVAL;
   ```

4. Создайте геттер для переменной:

   ```ts
   get BATCH_INSERT_OPERATION_INTERVAL(): number {
     return this.settingsService.settings.BATCH_INSERT_OPERATION_INTERVAL;
   }
   ```

### Пример использования переменных из настроек:

```ts
import { Injectable } from '@nestjs/common';
import { SettingService } from '@crypton-nestjs-kit/settings';

@Injectable()
export class SomeService {
  constructor(private readonly settingsService: SettingService) {}

  onModuleInit(): void {
    console.log(this.BATCH_INSERT_OPERATION_INTERVAL);
  }

  get BATCH_INSERT_OPERATION_INTERVAL(): number {
    return this.settingsService.settings.BATCH_INSERT_OPERATION_INTERVAL;
  }
}
```
