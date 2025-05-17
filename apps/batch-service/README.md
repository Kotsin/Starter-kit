# Batch Service

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Overview

Batch Service is responsible for handling batch operations and background tasks in the microservices architecture. Built with NestJS, it provides efficient processing of large-scale operations and scheduled tasks. The service solves the problem of bulk data insertion into the database by executing multiple operations in a single query, minimizing database load and improving overall performance.

## Features

- 📦 Batch Processing
  - Bulk operations
  - Queue management
  - Task scheduling
- 🔄 Background Jobs
  - Async task processing
  - Job prioritization
  - Transaction management
- 📊 Monitoring
  - Job status tracking
  - Performance metrics
  - Operation status notifications
- 🛠 Utilities
  - Error handling
  - Retry mechanisms
  - Batch operation splitting

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- PostgreSQL
- Redis
- RabbitMQ

## Installation

```bash
$ pnpm install
```

## Configuration

Create a `.env` file in the service root directory with the following configuration:

```env
# Environment
NODE_ENV=local

# Redis Configuration
REDIS_URL=redis://:password@localhost:6379/0

# Database Configuration
DB_HOST=127.0.0.1
DB_NAME=batch_service_db
DB_USERNAME=app_user
DB_PASSWORD=your_password
DB_PORT=5433

# RabbitMQ Configuration
RMQ_URL=amqp://@localhost:5672
RMQ_QUEUE=batch_service

# Batch Processing Settings
BATCH_PROCESS_OPERATION_INTERVAL=5000
BATCH_PROCESS_OPERATION_LIMIT=1000

# Logging
LOG_LEVEL=info
```

## Running the Application

### Using Docker
```bash
$ docker compose up
```

### Local Development
```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Project Structure

```
src/
├── client/        # Client implementations
├── controllers/   # API endpoints
├── entities/      # Database entities
├── interfaces/    # TypeScript interfaces
├── services/      # Business logic
└── main.ts        # Application entry point
```

## How It Works

### Operation Collection
- The service retrieves records from the `BatchOperations` table at intervals specified by `BATCH_PROCESS_OPERATION_INTERVAL`
- The number of operations processed is limited by `BATCH_PROCESS_OPERATION_LIMIT`

### SQL Query Execution
- Forms a single SQL query that executes within a transaction
- Falls back to individual operation execution if the batch query fails

### Status Notification
- Sends notifications to other services upon completion of batch operations

## Service Integration

### Available Methods

1. `createOperation(request: ICreateBatchOperationRequest): Promise<ICreateBatchOperationResponse>`
   - Adds a new operation to the Batch Service queue
   - Creates a new record in the `BatchOperations` table for processing in the next batch

2. `getOperation(request: IGetBatchOperationRequest): Promise<IGetBatchOperationResponse>`
   - Retrieves an operation from the database by its identifier
   - Returns the operation with the specified `id`

## API Documentation

The service exposes its API documentation through Swagger. Once running, you can access it at:
```
http://localhost:3000/api/docs
```

## Testing

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

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


