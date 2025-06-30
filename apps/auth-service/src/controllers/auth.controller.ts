import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AuthClientPatterns,
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
} from '@crypton-nestjs-kit/common';

import { AuthService } from '../services/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Нативная аутентификация (email/password)
   */
  @MessagePattern(AuthClientPatterns.AUTHENTICATE_NATIVE)
  public async authenticateNative(data: {
    credentials: INativeAuthCredentials;
    sessionData: {
      userAgent?: string;
      userIp?: string;
      fingerprint?: string;
      country?: string;
      city?: string;
      traceId?: string;
    };
  }): Promise<void> {
    return await this.authService.authenticateAndCreateSession(
      data.credentials,
      data.sessionData,
    );
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

  @MessagePattern(AuthClientPatterns.SESSION_CREATE)
  public async createSession(
    data: ISessionCreateRequest,
  ): Promise<ISessionCreateResponse> {
    return await this.authService.createSession(data);
  }

  @MessagePattern(AuthClientPatterns.TOKENS_CREATE)
  public async createToken(
    data: ITokenCreateRequest,
  ): Promise<ITokenCreateResponse> {
    return await this.authService.createTokens(data);
  }

  @MessagePattern(AuthClientPatterns.TOKEN_VERIFY)
  public async verifyToken(
    data: ITokenVerifyRequest,
  ): Promise<ITokenVerifyResponse> {
    return await this.authService.verifyToken(data);
  }

  @MessagePattern(AuthClientPatterns.REFRESH_TOKEN)
  public async refreshToken(
    data: ITokenRefreshRequest,
  ): Promise<ITokenRefreshResponse> {
    return await this.authService.refreshToken(data);
  }

  @MessagePattern(AuthClientPatterns.SESSION_TERMINATE_ALL)
  public async terminateAllSession(
    data: ITerminateAllRequest,
  ): Promise<ITerminateAllResponse> {
    return await this.authService.terminateAllSessions(data);
  }

  @MessagePattern(AuthClientPatterns.SESSION_TERMINATE)
  public async terminateSessionById(
    data: ITerminateSessionRequest,
  ): Promise<ITerminateSessionResponse> {
    return await this.authService.terminateSession(data);
  }

  @MessagePattern(AuthClientPatterns.GET_ACTIVE_SESSIONS)
  public async getActiveSessions(
    data: IActiveSessionsRequest,
  ): Promise<IActiveSessionsResponse> {
    return await this.authService.getActiveSessions(data);
  }

  @MessagePattern(AuthClientPatterns.GET_SESSIONS_HISTORY)
  public async getSessionsHistory(
    data: ISessionsHistoryRequest,
  ): Promise<ISessionsHistoryResponse> {
    return await this.authService.getSessionsHistory(data);
  }

  @MessagePattern(AuthClientPatterns.GET_SESSIONS_UNTIL_DATE)
  public async getSessionsUntilDate(
    data: ISessionUntilDateRequest,
  ): Promise<ISessionUntilDateResponse> {
    return await this.authService.getSessionsUntilDate(data);
  }
}
