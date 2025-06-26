# Система стратегий аутентификации

## Обзор

Система стратегий аутентификации предоставляет гибкий и расширяемый способ обработки различных типов аутентификации в auth-service. Она использует паттерн Strategy и Factory для автоматического выбора подходящей стратегии на основе переданных данных.

## Архитектура

### Основные компоненты

1. **IAuthStrategy** - интерфейс для всех стратегий аутентификации
2. **AuthStrategyFactory** - фабрика для создания и выбора стратегий
3. **AuthenticationService** - высокоуровневый сервис для работы с аутентификацией
4. **AuthenticationController** - контроллер для обработки запросов аутентификации

### Поддерживаемые стратегии

- **NativeStrategy** - нативная аутентификация (email/password)
- **GoogleOAuthStrategy** - OAuth аутентификация через Google
- **AppleOAuthStrategy** - OAuth аутентификация через Apple
- **TwitterOAuthStrategy** - OAuth аутентификация через Twitter

## Использование

### 1. Нативная аутентификация

```typescript
// Пример запроса для нативной аутентификации
const authRequest = {
  credentials: {
    email: 'user@example.com',
    password: 'userpassword'
  },
  sessionData: {
    userAgent: 'Mozilla/5.0...',
    userIp: '192.168.1.1',
    fingerprint: 'unique-fingerprint',
    country: 'US',
    city: 'New York',
    traceId: 'trace-123'
  }
};

// Отправка запроса
const result = await client.send('auth.authenticate.native', authRequest);
```

### 2. OAuth аутентификация

```typescript
// Пример запроса для OAuth аутентификации
const oauthRequest = {
  credentials: {
    provider: 'google', // или 'apple', 'twitter'
    accessToken: 'oauth-access-token',
    refreshToken: 'oauth-refresh-token' // опционально
  },
  sessionData: {
    userAgent: 'Mozilla/5.0...',
    userIp: '192.168.1.1',
    fingerprint: 'unique-fingerprint',
    country: 'US',
    city: 'New York',
    traceId: 'trace-123'
  }
};

// Отправка запроса
const result = await client.send('auth.authenticate.oauth', oauthRequest);
```

### 3. Автоматический выбор стратегии

```typescript
// Система автоматически определит тип стратегии на основе данных
const autoRequest = {
  credentials: {
    // Может быть либо { email, password } для нативной аутентификации
    // либо { provider, accessToken } для OAuth
  },
  sessionData: {
    // Данные сессии
  }
};

const result = await client.send('auth.authenticate', autoRequest);
```

## API Endpoints

### Аутентификация

- `auth.authenticate` - автоматический выбор стратегии
- `auth.authenticate.native` - нативная аутентификация
- `auth.authenticate.oauth` - OAuth аутентификация

### Валидация токенов

- `auth.validate.token` - валидация токена с указанной стратегией

### Управление стратегиями

- `auth.strategies.list` - получение списка доступных стратегий
- `auth.strategies.check` - проверка поддержки стратегии

## Структура ответов

### Успешная аутентификация

```typescript
{
  success: true,
  sessionId: 'session-uuid',
  tokens: {
    accessToken: 'jwt-access-token',
    refreshToken: 'jwt-refresh-token'
  },
  user: {
    id: 'user-uuid',
    email: 'user@example.com',
    name: 'User Name',
    provider: 'native', // или 'google', 'apple', 'twitter'
    providerId: 'provider-specific-id'
  }
}
```

### Ошибка аутентификации

```typescript
{
  success: false,
  error: 'Error message',
  errorCode: 'ERROR_CODE'
}
```

## Коды ошибок

- `AUTH_001` - Недействительный токен
- `AUTH_002` - Сессия не найдена
- `AUTH_003` - Сессия истекла
- `AUTH_004` - Недействительные учетные данные
- `AUTH_005` - Превышен лимит запросов
- `AUTH_006` - Превышен лимит сессий
- `AUTH_007` - Пользователь не найден

## Расширение системы

### Добавление новой стратегии

1. Создайте новый класс, реализующий интерфейс `IAuthStrategy`:

```typescript
@Injectable()
export class NewOAuthStrategy implements IAuthStrategy {
  async authenticate(credentials: any): Promise<IAuthResult> {
    // Реализация аутентификации
  }

  async validateToken(token: string): Promise<IAuthResult> {
    // Реализация валидации токена
  }
}
```

2. Добавьте новый тип в enum `AuthStrategyType`:

```typescript
export enum AuthStrategyType {
  NATIVE = 'native',
  GOOGLE = 'google',
  APPLE = 'apple',
  TWITTER = 'twitter',
  NEW_OAUTH = 'new-oauth', // Новый тип
}
```

3. Обновите `AuthStrategyFactory`:

```typescript
@Injectable()
export class AuthStrategyFactory {
  constructor(
    // ... другие стратегии
    private readonly newOAuthStrategy: NewOAuthStrategy,
  ) {}

  createStrategy(strategyType: AuthStrategyType): IAuthStrategy {
    switch (strategyType) {
      // ... другие случаи
      case AuthStrategyType.NEW_OAUTH:
        return this.newOAuthStrategy;
      default:
        throw new Error(`Unsupported auth strategy type: ${strategyType}`);
    }
  }
}
```

4. Зарегистрируйте новую стратегию в модуле:

```typescript
@Module({
  providers: [
    // ... другие провайдеры
    NewOAuthStrategy,
  ],
})
export class AuthModule {}
```

## Безопасность

- Все пароли хешируются с использованием bcrypt
- JWT токены подписываются секретным ключом
- Сессии имеют ограничения по количеству и времени жизни
- Поддерживается отпечаток устройства для дополнительной безопасности

## Мониторинг и логирование

Все операции аутентификации логируются с использованием встроенной системы логирования NestJS. Логи включают:

- Тип используемой стратегии
- Успешность операции
- Время выполнения
- Информацию о пользователе (без чувствительных данных)
- Ошибки и их коды 