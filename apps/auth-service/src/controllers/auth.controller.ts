import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  AuthClientPatterns,
  ControllerMeta,
  ControllerType,
  IActiveSessionsRequest,
  IActiveSessionsResponse,
  IAuthenticateNative,
  INativeAuthCredentials,
  INativeLoginResponse,
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
  IWeb3AuthCredentials,
  Permission,
} from '@crypton-nestjs-kit/common';

import { AuthService } from '../services/auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Native authentication (email/password)
   */
  @ControllerMeta({
    name: 'User authentication',
    description: 'Authenticate user using email and password',
    isPublic: true,
    type: ControllerType.WRITE,
    needsPermission: false,
  })
  @MessagePattern(AuthClientPatterns.AUTHENTICATE_NATIVE)
  public async authenticateNative(
    data: IAuthenticateNative,
  ): Promise<INativeLoginResponse> {
    try {
      return await this.authService.authenticateNative(data);
    } catch (e) {
      console.log(e.message);
    }
  }

  @ControllerMeta({
    name: 'Verify token',
    description: 'Verify access token',
    isPublic: false,
    needsPermission: false,
    type: ControllerType.READ,
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
    needsPermission: false,
    needsConfirmation: false,
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

  /**
   * Web3 authentication
   */
  @ControllerMeta({
    name: 'Web3 authentication',
    description: 'Authenticate user using Web3 wallet signature',
    isPublic: true,
    type: ControllerType.WRITE,
    needsPermission: false,
    needsConfirmation: false,
  })
  @MessagePattern(AuthClientPatterns.AUTHENTICATE_WEB3)
  public async authenticateWeb3(data: {
    credentials: IWeb3AuthCredentials;
    sessionData: ISessionData;
  }) {
    return await this.authService.authenticateNative(
      data
    );
  }

  /**
   * Generate Web3 nonce
   */
  @ControllerMeta({
    name: 'Generate Web3 nonce',
    description: 'Generate a nonce for Web3 authentication',
    isPublic: true,
    type: ControllerType.WRITE,
    needsPermission: false,
    needsConfirmation: false,
  })
  @MessagePattern(AuthClientPatterns.GENERATE_WEB3_NONCE)
  public async generateWeb3Nonce(data: { walletAddress: string }) {
    return await this.authService.generateWeb3Nonce(data.walletAddress);
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
    name: 'Get sessions until date',
    description: 'Get user sessions until a specific date',
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
