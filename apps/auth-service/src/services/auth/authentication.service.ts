import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AUTH_ERROR_CODES,
  AuthCredentials,
  AuthErrorMessages,
  AuthStrategyType,
  INativeAuthCredentials,
  IOAuthAuthCredentials,
  ISessionCreateRequest,
  ITokenCreateRequest,
} from '@crypton-nestjs-kit/common';
import { ConfigService } from '@crypton-nestjs-kit/config';

import { AuthService } from './auth.service';
import { AuthStrategyFactory } from './auth-strategy-factory.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly authStrategyFactory: AuthStrategyFactory,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Аутентификация пользователя с автоматическим выбором стратегии
   */
  async authenticate(credentials: AuthCredentials): Promise<any> {
    try {
      const result = await this.authStrategyFactory.authenticate(credentials);

      if (!result.status) {
        return {
          status: false,
          message:
            result.error ||
            AuthErrorMessages[AUTH_ERROR_CODES.INVALID_CREDENTIALS],
          error: null,
          errorCode: result.errorCode || AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        };
      }

      return {
        status: true,
        message: 'Authentication successful',
        user: result.user,
      };
    } catch (error) {
      return {
        status: false,
        message:
          error.message ||
          AuthErrorMessages[AUTH_ERROR_CODES.AUTHENTICATION_FAILED],
        error: error.message,
        errorCode: AUTH_ERROR_CODES.AUTHENTICATION_FAILED,
      };
    }
  }

  /**
   * Аутентификация с нативными учетными данными (email/password)
   */
  async authenticateNative(credentials: INativeAuthCredentials): Promise<any> {
    return this.authenticate(credentials);
  }

  /**
   * Аутентификация с OAuth учетными данными
   */
  async authenticateOAuth(credentials: IOAuthAuthCredentials): Promise<any> {
    return this.authenticate(credentials);
  }

  /**
   * Полная аутентификация с созданием сессии и токенов
   */
  async authenticateAndCreateSession(
    credentials: AuthCredentials,
    sessionData: {
      userAgent?: string;
      userIp?: string;
      fingerprint?: string;
      country?: string;
      city?: string;
      traceId?: string;
    },
  ): Promise<any> {
    try {
      // Аутентификация пользователя
      const authResult = await this.authenticate(credentials);

      if (!authResult.status || !authResult.user) {
        return {
          status: false,
          message: authResult.message,
          error: authResult.error,
          errorCode: authResult.errorCode,
        };
      }

      // Создание сессии
      const sessionRequest: ISessionCreateRequest = {
        userId: authResult.user.id,
        userAgent: sessionData.userAgent,
        userIp: sessionData.userIp,
        fingerprint: sessionData.fingerprint,
        country: sessionData.country,
        city: sessionData.city,
        traceId: sessionData.traceId || 'auth-session-trace',
      };
      const sessionResponse = await this.authService.createSession(
        sessionRequest,
      );

      if (!sessionResponse.status) {
        return {
          status: false,
          message: sessionResponse.message,
          error: sessionResponse.error,
          errorCode: sessionResponse.errorCode,
        };
      }

      // Создание токенов
      const tokenRequest: ITokenCreateRequest = {
        userId: authResult.user.id,
        sessionId: sessionResponse.sessionId,
      };
      const tokenResponse = await this.authService.createTokens(tokenRequest);

      if (!tokenResponse.status) {
        return {
          status: false,
          message: tokenResponse.message,
          error: tokenResponse.error,
          errorCode: tokenResponse.errorCode,
        };
      }

      return {
        status: true,
        message: 'User authenticated successfully',
        tokens: tokenResponse.tokens,
        user: authResult.user,
      };
    } catch (error) {
      return {
        status: false,
        message:
          error.message ||
          AuthErrorMessages[AUTH_ERROR_CODES.AUTHENTICATION_FAILED],
        error: error.message,
        errorCode: AUTH_ERROR_CODES.AUTHENTICATION_FAILED,
      };
    }
  }

  /**
   * Получение списка доступных стратегий
   */
  getAvailableStrategies(): AuthStrategyType[] {
    return this.authStrategyFactory.getAvailableStrategies();
  }

  /**
   * Проверка поддержки стратегии
   */
  isStrategySupported(strategyType: AuthStrategyType): boolean {
    return this.authStrategyFactory.isStrategySupported(strategyType);
  }

  /**
   * Создание JWT токена для пользователя
   */
  createJwtToken(userId: string, sessionId: string): string {
    const payload = { userId, sessionId };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get().auth.access_token_expires_in,
    });
  }

  /**
   * Валидация JWT токена
   */
  validateJwtToken(token: string): any {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get().auth.token_secret,
      });
    } catch (error) {
      throw new Error('Invalid JWT token');
    }
  }
}
