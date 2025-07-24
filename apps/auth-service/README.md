# Authentication Service

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Overview

The Authentication Service is a microservice component built with NestJS, responsible for handling user authentication, authorization, and session management. It provides a flexible and extensible authentication system with support for multiple authentication strategies, API key management, and invitation system.

## 🚀 Features

### Core Authentication
- 🔐 **Multiple Authentication Strategies**:
  - Native authentication (email/password)
  - Google OAuth2 integration
  - Apple Sign-in
  - Twitter OAuth
- 🏭 **Strategy Factory Pattern** - Automatic strategy selection based on credentials
- 🔑 **JWT-based Token Management** with access and refresh tokens
- 📱 **Session Management** with device fingerprinting and multi-device support

### API Key Management
- 🔑 **API Key Creation** and management
- 📋 **API Key Validation** and authentication
- 🔄 **API Key Updates** and permissions
- 🗑️ **API Key Deletion** and cleanup

### Invitation System
- 📧 **Invitation Creation** with customizable codes
- 📋 **Invitation Management** (list, cancel, validate)
- 🔗 **Invitation-based Registration** flow
- ⏰ **Invitation Expiration** handling

### Security & Performance
- 🛡️ **Rate Limiting** and brute force protection
- 🔒 **Session Security** with IP tracking and device fingerprinting
- ⚡ **Redis Caching** for high performance
- 🔄 **Database Replication** support
- 📊 **Comprehensive Logging** and monitoring

## 🏗️ Architecture

### Microservice Architecture
The service is designed as a microservice using RabbitMQ for communication:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│  Auth Service   │───▶│  User Service   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ Permission Svc  │
                       └─────────────────┘
```

### Strategy Pattern Implementation
The authentication system uses the Strategy pattern for flexible authentication:

```typescript
// Automatic strategy selection
const result = await authService.authenticate({
  credentials: { email: 'user@example.com', password: 'password' },
  sessionData: { userAgent: '...', userIp: '...', fingerprint: '...' }
});
```

## 📋 Prerequisites

- **Node.js** (LTS version 20+)
- **PNPM** package manager
- **PostgreSQL** database (15+)
- **Redis** (for caching and session storage)
- **RabbitMQ** (for microservice communication)

## 🛠️ Installation

1. **Install dependencies**:
```bash
pnpm install
```

2. **Environment Configuration**:
Create `.env` file based on the template:

```env
# Environment
NODE_ENV=local

# Authentication Configuration
AUTH_ACCESS_TOKEN_EXPIRES_IN=900000
AUTH_REFRESH_TOKEN_EXPIRES_IN=86400000
AUTH_TOKEN_SECRET=your_secret_key_here
AUTH_SESSION_CACHE_TTL=3600000
AUTH_MAX_SESSIONS_PER_USER=5

# Redis Configuration
REDIS_URL=redis://:password@localhost:6379/0

# Database Configuration
DB_HOST=127.0.0.1
DB_NAME=shared_db
DB_USERNAME=shared
DB_PASSWORD=your_password
DB_PORT=5433

# Database Replication Settings
RUN_MIGRATIONS=false
DB_REPLICATION=false
DB_REPLICATION_COUNT=2

# Replica 1 Configuration (if DB_REPLICATION=true)
DB_HOST_R_1=
DB_NAME_R_1=
DB_USERNAME_R_1=
DB_PASSWORD_R_1=
DB_PORT_R_1=

# RabbitMQ Services
AUTH_SERVICE_RMQ_URL=amqp://@localhost:5672
AUTH_SERVICE_RMQ_QUEUE=auth

USER_SERVICE_RMQ_URL=amqp://@localhost:5672
USER_SERVICE_RMQ_QUEUE=user

# Registration Process
INVITATION_REQUIRED=true

# Logging
LOG_LEVEL=info
```

## 🚀 Running the Application

### Using Docker (Recommended)

```bash
# Start the service with dependencies
docker compose up

# Run in detached mode
docker compose up -d

# View logs
docker compose logs -f auth-service
```

### Local Development

```bash
# Development mode with hot reload
pnpm run start:dev

# Debug mode
pnpm run start:debug

# Production build
pnpm run build
pnpm run start:prod

# Test mode
pnpm run start:test
```

## 📚 API Documentation

### Authentication Endpoints

| Pattern | Description | Type |
|---------|-------------|------|
| `auth.user.register` | User registration | WRITE |
| `auth.authenticate.native` | Native authentication | WRITE |
| `auth.token.verify` | Verify access token | READ |
| `auth.token.refresh` | Refresh access tokens | WRITE |
| `auth.session.terminate.all` | Terminate all sessions | WRITE |
| `auth.session.terminate` | Terminate specific session | WRITE |
| `auth.session.active` | Get active sessions | READ |
| `auth.session.history` | Get session history | READ |
| `auth.session.until.date` | Get sessions until date | READ |

### API Key Endpoints

| Pattern | Description | Type |
|---------|-------------|------|
| `auth.api-key.create` | Create API key | WRITE |
| `auth.api-key.list` | List API keys | READ |
| `auth.api-key.get` | Get API key by ID | READ |
| `auth.api-key.update` | Update API key | WRITE |
| `auth.api-key.remove` | Remove API key | WRITE |
| `auth.api-key.validate` | Validate API key | READ |

### Invitation Endpoints

| Pattern | Description | Type |
|---------|-------------|------|
| `invitation.create` | Create invitation | WRITE |
| `invitation.list` | Get invitations | READ |
| `invitation.get.by.code` | Get invitation by code | READ |
| `invitation.cancel` | Cancel invitation | WRITE |

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:cov
```

## 📁 Project Structure

```
src/
├── auth.module.ts              # Main application module
├── main.ts                     # Application entry point
├── controllers/                # API endpoints and route handlers
│   ├── auth.controller.ts      # Authentication endpoints
│   ├── api-key.controller.ts   # API key management
│   └── invitation.controller.ts # Invitation system
└── services/                   # Business logic layer
    ├── auth/                   # Authentication services
    │   ├── auth.service.ts     # Main auth service
    │   ├── auth-strategy-factory.service.ts # Strategy factory
    │   └── strategies/         # Authentication strategies
    │       ├── native.strategy.ts
    │       ├── google-oauth.strategy.ts
    │       ├── apple-oauth.strategy.ts
    │       └── twitter-oauth.strategy.ts
    ├── api-key/                # API key services
    │   └── api-key.service.ts
    └── invitation/             # Invitation services
        └── invitation.service.ts
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm run start:dev` | Start in development mode with hot reload |
| `pnpm run start:debug` | Start in debug mode |
| `pnpm run start:test` | Start in test mode |
| `pnpm run build` | Build the application |
| `pnpm run start:prod` | Start in production mode |
| `pnpm run lint` | Run ESLint with auto-fix |
| `pnpm run format` | Format code using Prettier |
| `pnpm run test` | Run tests |
| `pnpm run docs:generate` | Generate API documentation |
| `pnpm run docs:serve` | Serve API documentation |

## 🔧 Dependencies

### Core Dependencies
- **@nestjs/common** - NestJS core framework
- **@nestjs/microservices** - Microservice support
- **@nestjs/jwt** - JWT handling
- **@nestjs/passport** - Authentication strategies
- **@nestjs/typeorm** - Database ORM
- **@nestjs/cache-manager** - Caching support

### Authentication & Security
- **passport** - Authentication middleware
- **passport-google-oauth20** - Google OAuth strategy
- **passport-apple** - Apple Sign-in strategy
- **passport-twitter** - Twitter OAuth strategy
- **bcrypt** - Password hashing
- **nestjs-throttler** - Rate limiting

### Database & Caching
- **typeorm** - Database ORM
- **pg** - PostgreSQL driver
- **redis** - Redis client
- **cache-manager-redis-yet** - Redis cache store

### Utilities
- **axios** - HTTP client
- **uuid** - UUID generation
- **randomstring** - Random string generation
- **class-validator** - Validation decorators
- **class-transformer** - Object transformation

## 🔐 Security Features

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds
- **JWT Signing**: HMAC-SHA256 with configurable secret
- **Token Expiration**: Configurable access and refresh token TTL
- **Session Management**: Device fingerprinting and IP tracking
- **Rate Limiting**: Protection against brute force attacks

### API Security
- **API Key Validation**: Secure API key authentication
- **Service Token Generation**: Internal service communication
- **Permission-based Access**: Role and permission validation
- **Request Validation**: Input sanitization and validation

## 📊 Monitoring & Logging

### Logging
- **Structured Logging**: Winston-based logging system
- **Request Tracing**: Correlation ID tracking
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Request timing and metrics

### Health Checks
- **Database Connectivity**: PostgreSQL connection monitoring
- **Redis Connectivity**: Cache service monitoring
- **RabbitMQ Connectivity**: Message queue monitoring
- **Service Health**: Overall service status

## 🔄 Database Schema

### Core Entities
- **SessionEntity**: User session management
- **ApiKeyEntity**: API key storage and validation
- **InvitationEntity**: Invitation system management

### Relationships
- Sessions are linked to users via user ID
- API keys are associated with specific users
- Invitations can be created by users with appropriate permissions

## 🚀 Deployment

### Docker Deployment
```bash
# Build the image
docker build -t auth-service .

# Run the container
docker run -d \
  --name auth-service \
  --env-file .env \
  -p 3000:3000 \
  auth-service
```

### Environment Variables
All configuration is handled through environment variables. See the `.env` template above for required variables.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
pg_isready -h localhost -p 5432

# Verify environment variables
echo $DB_HOST $DB_NAME $DB_USERNAME
```

#### Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping

# Check Redis configuration
redis-cli config get *
```

#### RabbitMQ Issues
```bash
# Check RabbitMQ status
rabbitmqctl status

# Verify queue configuration
rabbitmqctl list_queues
```

#### Authentication Errors
- Verify JWT secret configuration
- Check OAuth provider credentials
- Ensure Redis is running for session storage
- Validate API key permissions

### Performance Issues
- Monitor Redis cache hit rates
- Check database query performance
- Verify RabbitMQ queue sizes
- Review rate limiting configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the [AUTH_STRATEGIES.md](./AUTH_STRATEGIES.md) for detailed authentication documentation

## 🔗 Related Documentation

- [Authentication Strategies](./AUTH_STRATEGIES.md) - Detailed strategy documentation
- [API Documentation](../../docs/) - Complete API reference
- [Microservice Architecture](../../README.md) - Overall system architecture