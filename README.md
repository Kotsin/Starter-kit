# Starter-kit Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Overview

ZarGates Backend is a modern microservices-based application built with NestJS. The system is designed to provide a scalable, maintainable, and robust backend infrastructure for handling various business operations through a set of specialized services.

## Architecture

The project follows a microservices architecture pattern with the following key components:

### Core Services

1. **API Gateway** (`apps/api-gateway`)
   - Main entry point for all client requests
   - Handles authentication and authorization
   - Routes requests to appropriate microservices
   - Implements rate limiting and request validation

2. **Auth Service** (`apps/auth-service`)
   - Manages user authentication
   - Handles JWT token generation and validation
   - Supports multiple authentication strategies
   - Manages user sessions

3. **User Service** (`apps/user-service`)
   - Manages user profiles and data
   - Handles user-related operations
   - Provides user preference management
   - Implements access control

4. **Batch Service** (`apps/batch-service`)
   - Handles bulk operations
   - Manages background tasks
   - Provides efficient data processing
   - Implements operation queuing

5. **Notification Gateway** (`apps/notification-gateway`)
   - Manages real-time notifications
   - Handles WebSocket connections
   - Provides event broadcasting
   - Implements connection pooling

6. **WebSocket Coordinator** (`apps/ws-coordinator-service`)
   - Coordinates WebSocket connections
   - Manages service discovery
   - Handles load balancing
   - Provides connection monitoring

### Shared Packages

Located in the `packages/` directory:

- **Common** (`packages/common`)
  - Shared utilities
  - Common interfaces
  - Shared DTOs
  - Error handling

- **Config** (`packages/config`)
  - Configuration management
  - Environment variables
  - Service settings

- **Database** (`packages/database`)
  - Database connections
  - Migrations
  - Entity definitions

- **Logger** (`packages/logger`)
  - Centralized logging
  - Log formatting
  - Error tracking

## Technology Stack

- **Framework**: NestJS v10
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Database**: PostgreSQL
- **Caching**: Redis
- **Message Broker**: RabbitMQ
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Container**: Docker
- **Monorepo Management**: Nx

## Prerequisites

- Node.js v20 or higher
- pnpm
- Docker and Docker Compose
- PostgreSQL
- Redis
- RabbitMQ

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/zargates-backend.git
   cd zargates-backend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a root `.env` file:
   ```env
   # RabbitMQ Configuration
   RABBITMQ_DEFAULT_USER=user
   RABBITMQ_DEFAULT_PASS=your_password
   RABBITMQ_PORT=5672

   # Redis Configuration
   REDIS_DEFAULT_PSWD=your_password
   REDIS_PORT=6379

   # Database Configuration
   DB_HOST=127.0.0.1
   DB_NAME=shared_db
   DB_USERNAME=app_user
   DB_PASSWORD=your_password
   DB_PORT=5433
   ```

   Each service also requires its own `.env` file. See individual service READMEs for details.

4. **Start infrastructure services**
   ```bash
   docker compose -f docker/compose/docker-compose.yml up -d
   ```

5. **Start the services**
   ```bash
   # Development mode
   pnpm run start:dev

   # Production mode
   pnpm run build
   pnpm run start:prod
   ```

## Development

### Project Structure
```
.
├── apps/                   # Microservices
│   ├── api-gateway/       # API Gateway service
│   ├── auth-service/      # Authentication service
│   ├── user-service/      # User management service
│   ├── batch-service/     # Batch processing service
│   ├── notification-gateway/  # Real-time notifications
│   └── ws-coordinator-service/  # WebSocket coordination
├── packages/              # Shared packages
│   ├── common/           # Shared utilities and interfaces
│   ├── config/           # Configuration management
│   ├── database/         # Database related code
│   └── logger/           # Logging utilities
├── docker/               # Docker configurations
└── docs/                 # Documentation
```

### Service Communication

Services communicate through:
1. **RabbitMQ** for asynchronous messaging
2. **Redis** for caching and real-time events
3. **HTTP/REST** for synchronous communication (via API Gateway)
4. **WebSocket** for real-time bi-directional communication

### Database Management

- Each service can have its own database
- Shared database configurations are managed through the database package
- Migrations are handled per service
- Database replication is supported for high availability

## Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Deployment

The application can be deployed using Docker:

```bash
# Build all services
docker compose build

# Start the entire stack
docker compose up -d
```

## Documentation

- Each service has its own Swagger documentation
- API Gateway Swagger UI: `http://localhost:3001/api/docs`
- Individual service documentation is available in their respective directories

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes (using conventional commits)
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
