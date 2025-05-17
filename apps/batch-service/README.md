# Batch Service

## Описание

Batch Service решает проблему массовой вставки данных в базу данных. Он позволяет выполнять множество операций одним запросом, минимизируя нагрузку на базу и повышая общую производительность.

## Установка и запуск

1. **Установка зависимостей:**

   ```bash
   pnpm -r i
   ```

2. **Сборка проекта:**

   ```bash
   pnpm -r build
   ```

3. **Создайте файл `.env` и заполните его следующими параметрами:**

   ```plaintext
   NODE_ENV=

   BATCH_SERVICE_RMQ_URL=
   BATCH_SERVICE_RMQ_QUEUE=

   MARKETPLACE_RMQ_URL=
   MARKETPLACE_RMQ_QUEUE=

   REDIS_HOST=
   REDIS_PORT=

   DB_HOST=
   DB_NAME=
   DB_USERNAME=
   DB_PASSWORD=
   DB_PORT=
   ```

4. **Запуск сервиса:**
   ```bash
   pnpm run start:dev
   ```

## Как работает Batch Service

1. **Сбор операций:**

   - По интервалу, указанному в `BATCH_PROCESS_OPERATION_INTERVAL` (ms), сервис извлекает записи из таблицы `BatchOperations`.
   - Количество извлекаемых операций ограничено значением `BATCH_PROCESS_OPERATION_LIMIT`.

2. **Выполнение SQL-запросов:**

   - Формируется один общий SQL-запрос, который выполняется транзакцией.
   - Если общий запрос не удается выполнить, сервис переходит к поочередному выполнению операций.

3. **Уведомление о статусе:**
   - По окончанию выполнения процесса сервис отправляет уведомления другим сервисам.

  
## Взаимодействиее с Batch Service


### 1. `createOperation(request: ICreateBatchOperationRequest): Promise<ICreateBatchOperationResponse>`
Добавляет новую операцию в очередь Batch Service.

- **Описание:** 
  - Этот метод добавляет новую запись в таблицу `BatchOperations`, которая будет обработана в следующем батче.

### 2. `getOperation(request: IGetBatchOperationRequest): Promise<IGetBatchOperationResponse>`
Получает операцию из базы данных по её идентификатору.

- **Описание:**
  - Этот метод возвращает операцию с указанным `id`.


