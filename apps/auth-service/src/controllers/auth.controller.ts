import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AuthClientPatterns,
  ControllerMeta,
  ControllerType,
  IActiveSessionsRequest,
  IActiveSessionsResponse,
  INativeAuthCredentials,
  IOAuthAuthCredentials,
  ISessionCreateRequest,
  ISessionCreateResponse,
  ISessionData,
  ISessionsHistoryRequest,
  ISessionsHistoryResponse,
  ISessionUntilDateRequest,
  ISessionUntilDateResponse,
  ITerminateAllRequest,
  ITerminateAllResponse,
  ITerminateSessionRequest,
  ITerminateSessionResponse,
  ITokenCreateRequest,
  ITokenCreateResponse,
  ITokenRefreshRequest,
  ITokenRefreshResponse,
  ITokenVerifyRequest,
  ITokenVerifyResponse,
  Permission,
} from '@crypton-nestjs-kit/common';

import { AuthService } from '../services/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Нативная аутентификация (email/password)
   */
  @ControllerMeta({
    name: 'Аутентификация пользователя',
    description: 'Аутентификация пользователя с помощью email и пароля 1',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(AuthClientPatterns.AUTHENTICATE_NATIVE)
  public async authenticateNative(data: {
    credentials: INativeAuthCredentials;
    sessionData: {
      userAgent?: string;
      userIp?: string;
      fingerprint?: string;
      country?: string;
      city?: string;
    };
    traceId?: string;
  }): Promise<void> {
    try {
      return await this.authService.authenticateAndCreateSession(
        data.credentials,
        data.sessionData,
      );
    } catch (e) {
      console.log(e.message);
    }
  }

  /**
   * OAuth аутентификация
   */
  @MessagePattern(AuthClientPatterns.AUTHENTICATE_SOCIAL)
  public async authenticateOAuth(data: {
    credentials: IOAuthAuthCredentials;
    sessionData: ISessionData;
  }) {
    return await this.authService.authenticateAndCreateSession(
      data.credentials,
      data.sessionData,
    );
  }

  @ControllerMeta({
    name: 'Sessions creating',
    description: 'Создание сессии пользователя',
    isPublic: false,
  })
  @MessagePattern(AuthClientPatterns.SESSION_CREATE)
  public async createSession(
    data: ISessionCreateRequest,
  ): Promise<ISessionCreateResponse> {
    return await this.authService.createSession(data);
  }

  @ControllerMeta({
    name: 'Create tokens',
    description: 'Create access and refresh tokens',
    isPublic: false,
  })
  @MessagePattern(AuthClientPatterns.TOKENS_CREATE)
  public async createTokens(
    data: ITokenCreateRequest,
  ): Promise<ITokenCreateResponse> {
    return await this.authService.createTokens(data);
  }

  @ControllerMeta({
    name: 'Verify token',
    description: 'Verify access token',
    isPublic: false,
  })
  @MessagePattern(AuthClientPatterns.TOKEN_VERIFY)
  public async verifyToken(
    data: ITokenVerifyRequest,
  ): Promise<ITokenVerifyResponse> {
    return await this.authService.verifyToken(data);
  }

  @ControllerMeta({
    name: 'Refresh token',
    description: 'Refresh access tokens',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(AuthClientPatterns.REFRESH_TOKEN)
  public async refreshToken(
    data: ITokenRefreshRequest,
  ): Promise<ITokenRefreshResponse> {
    return await this.authService.refreshToken(data);
  }

  @ControllerMeta({
    name: 'Terminate all sessions',
    description: 'Terminate all user sessions',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(AuthClientPatterns.SESSION_TERMINATE_ALL)
  public async terminateAllSession(
    data: ITerminateAllRequest,
  ): Promise<ITerminateAllResponse> {
    return await this.authService.terminateAllSessions(data);
  }

  @ControllerMeta({
    name: 'Terminate session',
    description: 'Terminate session by id',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(AuthClientPatterns.SESSION_TERMINATE)
  public async terminateSessionById(
    data: ITerminateSessionRequest,
  ): Promise<ITerminateSessionResponse> {
    return await this.authService.terminateSession(data);
  }

  @ControllerMeta({
    name: 'Get active sessions',
    description: 'Get active sessions for user',
    isPublic: true,
    type: ControllerType.READ,
  })
  @MessagePattern(AuthClientPatterns.GET_ACTIVE_SESSIONS)
  public async getActiveSessions(
    data: IActiveSessionsRequest,
  ): Promise<IActiveSessionsResponse> {
    return await this.authService.getActiveSessions(data);
  }

  @ControllerMeta({
    name: 'Get sessions history',
    description: 'Get sessions history for user',
    isPublic: true,
    type: ControllerType.READ,
  })
  @MessagePattern(AuthClientPatterns.GET_SESSIONS_HISTORY)
  public async getSessionsHistory(
    data: ISessionsHistoryRequest,
  ): Promise<ISessionsHistoryResponse> {
    return await this.authService.getSessionsHistory(data);
  }

  @ControllerMeta({
    name: 'Get active sessions',
    description: 'Get active sessions for user',
    isPublic: false,
    type: ControllerType.READ,
  })
  @MessagePattern(AuthClientPatterns.GET_SESSIONS_UNTIL_DATE)
  public async getSessionsUntilDate(
    data: ISessionUntilDateRequest,
  ): Promise<ISessionUntilDateResponse> {
    return await this.authService.getSessionsUntilDate(data);
  }
}
