# API Gateway Service

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

API Gateway service is a part of the microservices architecture, built with NestJS. It serves as the main entry point for all client requests, handling authentication, request routing, and communication with other microservices.

## Features

- 🔐 Authentication & Authorization
  - JWT-based authentication
  - OAuth2 support (Google, Twitter, Apple)
  - Role-based access control
- 🚦 Request Management
  - Rate limiting
  - Request validation
  - Error handling
- 📝 API Documentation
  - Swagger/OpenAPI integration
  - API versioning (v1)
- 🔄 Microservices Communication
  - RabbitMQ integration
  - Redis caching
- 🛠 Additional Features
  - Health checks
  - Cors support
  - Request throttling
  - TypeORM integration

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- Redis
- PostgreSQL
- RabbitMQ

## Installation

```bash
# Install dependencies
pnpm install
```

## Configuration

The service uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=your_db_name

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h
```

## Running the Service

```bash
# Development
pnpm start:dev

# Debug mode
pnpm start:debug

# Production mode
pnpm build
pnpm start:prod

# Run tests
pnpm test
```

## Project Structure

```
src/
├── decorators/     # Custom decorators
├── guards/         # Authentication guards
├── dto/           # Data Transfer Objects
├── interceptors/  # Request/Response interceptors
├── pipes/         # Validation pipes
├── v1/            # API version 1 endpoints
├── gateway.module.ts
├── gateway.controller.ts
└── main.ts
```

## API Documentation

Once the service is running, you can access the Swagger documentation at:
```
http://localhost:3000/api/docs
```

## Testing

```bash
# Run tests
pnpm test

# Test coverage
pnpm test:cov
```

## Dependencies

### Main Dependencies
- @nestjs/common: ^10.4.15
- @nestjs/core: ^10.4.15
- @nestjs/swagger: ^7.4.2
- @nestjs/typeorm: ^10.0.2
- @nestjs/microservices: ^10.4.15
- @nestjs/passport: ^10.0.3

### Development Dependencies
- TypeScript
- ESLint
- Prettier
- Jest

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Filling in the parameters .env
```
NODE_ENV=local
PORT=

SWAGGER_USERNAME=
SWAGGER_PASSWORD=

SECRET_API_KEY=
AMIKIN_SECRET_KEY=

REDIS_HOST=
REDIS_PORT=

JWT_ACCESS_TOKEN_SECRET=
JWT_REFRESH_TOKEN_SECRET=
TOKEN_EXPIRY=

AUTH_SERVICE_RMQ_URL=
AUTH_SERVICE_RMQ_QUEUE=

USER_SERVICE_RMQ_URL=
USER_SERVICE_RMQ_QUEUE=

GAME_SERVICE_RMQ_URL=
GAME_SERVICE_RMQ_QUEUE=

OFFER_MANAGER_RMQ_URL=
OFFER_MANAGER_RMQ_QUEUE=

TG_BOT_NAME=

LOG_LEVEL=info

```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod