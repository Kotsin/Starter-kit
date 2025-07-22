import { Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AUTH_ERROR_CODES,
  AuthCredentials,
  AuthenticationError,
  AuthErrorMessages,
  IActiveSessionsRequest,
  IActiveSessionsResponse,
  IAuthenticateNative,
  ICachedSessionData,
  IDeleteSessionRequest,
  INativeLoginResponse,
  IOAuthAuthCredentials,
  ISessionCreateRequest,
  ISessionCreateResponse,
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
  IUserRegistrationRequest,
  IUserRegistrationResponse,
  PermissionClient,
  ServiceJwtGenerator,
  SessionEntity,
  SessionStatus,
  UserClient,
} from '@crypton-nestjs-kit/common';
import { ConfigService } from '@crypton-nestjs-kit/config';
import { In, LessThan, Repository } from 'typeorm';

import { InvitationService } from '../invitation/invitation.service';

import { AuthStrategyFactory } from './auth-strategy-factory.service';

// Интерфейсы для типизации параметров и возвращаемых значений

interface IExistingUserCheckResult {
  status: boolean;
  message: string;
  errorCode?: AUTH_ERROR_CODES;
  user?: any;
}

interface IInvitationValidationResult {
  status: boolean;
  invitationRequired?: boolean;
  invitationData?: any;
  message: string;
  error?: string;
  errorCode?: AUTH_ERROR_CODES;
}

interface IUserCreationResult {
  status: boolean;
  user?: any;
  message: string;
  error?: string;
  errorCode?: AUTH_ERROR_CODES;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionRepo: Repository<SessionEntity>,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly userClient: UserClient,
    private readonly permissionClient: PermissionClient,
    private readonly authStrategyFactory: AuthStrategyFactory,
    private readonly serviceJwtGenerator: ServiceJwtGenerator,
    private readonly invitationService: InvitationService,
  ) {}

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
   * Аутентификация с OAuth учетными данными
   */
  async authenticateOAuth(credentials: IOAuthAuthCredentials): Promise<any> {
    return this.authenticate(credentials);
  }

  /**
   * Полная аутентификация с созданием сессии и токенов
   */
  async authenticateNative(
    data: IAuthenticateNative,
  ): Promise<INativeLoginResponse> {
    try {
      const { credentials, sessionData, traceId } = data;
      const authResult = await this.authenticate(credentials);

      if (!authResult.status || !authResult.user) {
        return {
          status: false,
          message: authResult.message,
          user: null,
          tokens: null,
          error: authResult.error,
          errorCode: authResult.errorCode,
        };
      }

      const sessionRequest: ISessionCreateRequest = {
        userId: authResult.user.id,
        userAgent: sessionData.userAgent,
        userIp: sessionData.userIp,
        fingerprint: sessionData.fingerprint,
        country: sessionData.country,
        city: sessionData.city,
        traceId: traceId || 'auth-session-trace',
      };
      const sessionResponse = await this.createSession(sessionRequest);

      if (!sessionResponse.status) {
        return {
          status: false,
          message: sessionResponse.message,
          user: null,
          tokens: null,
          error: sessionResponse.error,
          errorCode: sessionResponse.errorCode,
        };
      }

      const tokenRequest: ITokenCreateRequest = {
        userId: authResult.user.id,
        sessionId: sessionResponse.sessionId,
      };
      const tokenResponse = await this.createTokens(tokenRequest);

      if (!tokenResponse.status) {
        return {
          status: false,
          message: tokenResponse.message,
          user: null,
          tokens: null,
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
        user: null,
        tokens: null,
        error: error.message,
        errorCode: AUTH_ERROR_CODES.AUTHENTICATION_FAILED,
      };
    }
  }

  /**
   * Регистрация пользователя с поддержкой приглашений
   */
  async registerUser(
    data: IUserRegistrationRequest,
  ): Promise<IUserRegistrationResponse> {
    try {
      const traceId = data.traceId || 'register-user-trace';
      const serviceToken = await this.generateServiceToken(data.login);

      const existingUserCheck = await this.checkExistingUser(
        data.login,
        traceId,
        serviceToken,
      );

      if (!existingUserCheck.status) {
        return existingUserCheck;
      }

      const invitationValidation = await this.validateInvitation(
        data.invitationCode,
      );

      if (!invitationValidation.status) {
        return invitationValidation;
      }

      const userCreation = await this.createUserWithInvitation(
        data,
        traceId,
        serviceToken,
        invitationValidation.invitationData,
      );

      if (!userCreation.status) {
        return userCreation;
      }

      if (
        invitationValidation.invitationRequired &&
        invitationValidation.invitationData
      ) {
        await this.useInvitationAfterCreation(
          data.invitationCode,
          userCreation.user.id,
        );
      }

      return {
        status: true,
        message: 'User registered successfully',
        user: userCreation.user,
        created: true,
      };
    } catch (error) {
      return this.handleRegistrationError(error);
    }
  }

  private async generateServiceToken(login: string): Promise<string> {
    return await this.serviceJwtGenerator.generateServiceJwt({
      subject: login,
      actor: 'auth-service',
      issuer: 'auth-service',
      audience: 'user',
      type: 'service',
      expiresIn: '5m',
    });
  }

  private async checkExistingUser(
    login: string,
    traceId: string,
    serviceToken: string,
  ): Promise<IExistingUserCheckResult> {
    const existingUserResult = await this.userClient.getUserByLoginSecure(
      { login },
      traceId,
      serviceToken,
    );

    if (existingUserResult.status && existingUserResult.user) {
      return {
        status: false,
        message: AuthErrorMessages[AUTH_ERROR_CODES.USER_ALREADY_EXISTS],
        errorCode: AUTH_ERROR_CODES.USER_ALREADY_EXISTS,
        user: existingUserResult.user,
      };
    }

    return { status: true, message: 'User does not exist' };
  }

  private async validateInvitation(
    invitationCode?: string,
  ): Promise<IInvitationValidationResult> {
    const invitationRequired = process.env.INVITATION_REQUIRED === 'true';

    if (!invitationRequired) {
      return {
        status: true,
        message: 'Invitation not required',
        invitationRequired: false,
        invitationData: null,
      };
    }

    if (!invitationCode) {
      return {
        status: false,
        message: 'Invitation code is required for registration',
        errorCode: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      };
    }

    try {
      const invitationResult = await this.invitationService.getInvitation(
        invitationCode,
      );

      if (!invitationResult.status || !invitationResult.invitation) {
        return {
          status: false,
          message: invitationResult.message || 'Invalid invitation code',
          error: invitationResult.message || 'Invalid invitation code',
          errorCode: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        };
      }

      return {
        status: true,
        message: 'Invitation validated successfully',
        invitationRequired: true,
        invitationData: invitationResult.invitation,
      };
    } catch (invitationError) {
      return {
        status: false,
        message: 'Failed to validate invitation code',
        error: invitationError.message,
        errorCode: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
      };
    }
  }

  private async createUserWithInvitation(
    data: IUserRegistrationRequest,
    traceId: string,
    serviceToken: string,
    invitationData: any,
  ): Promise<IUserCreationResult> {
    try {
      const userResult = await this.userClient.ensureUserExists(
        {
          login: data.login,
          password: data.password,
          loginType: data.loginType,
          invitedBy: invitationData?.createdBy,
          roleId: invitationData?.invitedUserRole || null,
        },
        traceId,
        serviceToken,
      );

      if (!userResult.status) {
        return {
          status: false,
          message: userResult.message || 'User creation failed',
          error: userResult.error || 'Failed to create user',
          errorCode: AUTH_ERROR_CODES.UNKNOWN_ERROR,
          user: null,
        };
      }

      if (!userResult.created) {
        return {
          status: false,
          message: 'User already exists',
          error: 'User with this login already exists',
          errorCode: AUTH_ERROR_CODES.USER_ALREADY_EXISTS,
          user: userResult.user,
        };
      }

      return {
        status: true,
        message: 'User created successfully',
        user: userResult.user,
      };
    } catch (userCreationError) {
      return {
        status: false,
        message: 'User creation failed',
        error: userCreationError.message,
        errorCode: AUTH_ERROR_CODES.UNKNOWN_ERROR,
        user: null,
      };
    }
  }

  private async useInvitationAfterCreation(
    invitationCode: string,
    userId: string,
  ): Promise<void> {
    try {
      const useInvitationResult = await this.invitationService.useInvitation(
        invitationCode,
        userId,
      );

      if (!useInvitationResult.status) {
        console.error(
          'Failed to use invitation after user creation:',
          useInvitationResult.message,
        );
      }
    } catch (invitationUsageError) {
      console.error(
        'Exception during invitation usage:',
        invitationUsageError.message,
      );
    }
  }

  /**
   * Обработка общих ошибок регистрации
   */
  private handleRegistrationError(error: any): any {
    return {
      status: false,
      message: 'Registration process failed',
      error: error.message || AuthErrorMessages[AUTH_ERROR_CODES.UNKNOWN_ERROR],
      errorCode: AUTH_ERROR_CODES.UNKNOWN_ERROR,
      user: null,
    };
  }

  /**
   * Creates a new session based on the provided request data.
   *
   * @param {ISessionCreateRequest} data
   * @return {Promise<ISessionCreateResponse>} An object with the following properties:
   *
   */
  private async createSession(
    data: ISessionCreateRequest,
  ): Promise<ISessionCreateResponse> {
    try {
      const activeSessions = await this.sessionRepo.count({
        where: { userId: data.userId, status: SessionStatus.ACTIVE },
      });

      if (
        activeSessions >= this.configService.get().auth.max_sessions_per_user
      ) {
        throw new AuthenticationError(
          AuthErrorMessages[AUTH_ERROR_CODES.SESSION_LIMIT_EXCEEDED],
          AUTH_ERROR_CODES.SESSION_LIMIT_EXCEEDED,
        );
      }

      const userResult = await this.userClient.getUserById(
        {
          userId: data.userId,
        },
        data.traceId,
        await this.serviceJwtGenerator.generateServiceJwt({
          subject: data.userId,
          actor: 'auth-service',
          issuer: 'auth-service',
          audience: 'user',
          type: 'service',
          expiresIn: '5m',
        }),
      );

      const sessionData = {
        userId: data.userId,
        userAgent: data.userAgent,
        userIp: data.userIp,
        role: userResult.user['roles'][0]['role'].id,
        fingerprint: data.fingerprint,
        country: data.country,
        city: data.city,
      };

      const session = await this.sessionRepo.save(
        this.sessionRepo.create(sessionData),
      );

      const cacheKey = `auth:${session.id}`;

      await this.cacheManager.set(
        cacheKey,
        sessionData,
        this.configService.get().auth.session_cache_ttl,
      );

      return {
        status: true,
        message: 'Session created successfully',
        sessionId: session.id,
      };
    } catch (error) {
      let errorCode = AUTH_ERROR_CODES.SESSION_CREATION_FAILED;
      let errorMessage = error.message;

      if (error instanceof AuthenticationError) {
        errorCode = error.code as AUTH_ERROR_CODES;
        errorMessage = null;
      }

      return {
        status: false,
        message: error.message || AuthErrorMessages[errorCode],
        sessionId: null,
        error: errorMessage,
        errorCode,
      };
    }
  }

  /**
   * Creates and returns two types of JSON Web Tokens (JWTs): an access token and a refresh token.
   *
   * @param {ITokenCreateRequest} data
   * @return {Promise<ITokenCreateResponse>} An object with the following properties:
   */
  private async createTokens(
    data: ITokenCreateRequest,
  ): Promise<ITokenCreateResponse> {
    try {
      const jwtPayload = {
        userId: data.userId,
        sessionId: data.sessionId,
      };

      // const accessToken = this.jwtService.sign(jwtPayload, {
      //   expiresIn: this.configService.get().auth.access_token_expires_in,
      // });
      //
      // const refreshToken = this.jwtService.sign(jwtPayload, {
      //   expiresIn: this.configService.get().auth.refresh_token_expires_in,
      // });

      const accessToken = this.jwtService.sign(jwtPayload, {
        expiresIn: '1d',
      });

      const refreshToken = this.jwtService.sign(jwtPayload, {
        expiresIn: '1d',
      });

      return {
        status: true,
        message: 'Tokens created successfully',
        tokens: { accessToken, refreshToken },
      };
    } catch (e) {
      return {
        status: false,
        message: e.message,
        tokens: null,
        error: e.message,
        errorCode: AUTH_ERROR_CODES.TOKEN_CREATION_FAILED,
      };
    }
  }

  /**
   * Terminates all active sessions for a given user.
   *
   * @param {ITerminateAllRequest} data
   * @return {Promise<ITerminateAllResponse>} Promise resolving to a response object indicating success or failure.
   */
  public async terminateAllSessions(
    data: ITerminateAllRequest,
  ): Promise<ITerminateAllResponse> {
    try {
      if (!data.userId) {
        throw new AuthenticationError(
          AuthErrorMessages[AUTH_ERROR_CODES.SESSION_NOT_FOUND],
          AUTH_ERROR_CODES.SESSION_NOT_FOUND,
        );
      }

      const sessions = await this.sessionRepo.find({
        where: { userId: data.userId, status: SessionStatus.ACTIVE },
      });

      if (sessions.length == 0) {
        throw new AuthenticationError(
          AuthErrorMessages[AUTH_ERROR_CODES.SESSION_NOT_FOUND],
          AUTH_ERROR_CODES.SESSION_NOT_FOUND,
        );
      }

      for (const session of sessions) {
        await this.cacheManager.del(`auth:${session.id}`);
      }

      await this.sessionRepo.update(
        { userId: data.userId, status: SessionStatus.ACTIVE },
        { status: SessionStatus.TERMINATED },
      );

      return {
        status: true,
        message: 'Sessions terminated',
      };
    } catch (error) {
      let errorCode = AUTH_ERROR_CODES.SESSIONS_TERMINATION_FAILED;
      let errorMessage = error.message;

      if (error instanceof AuthenticationError) {
        errorCode = error.code as AUTH_ERROR_CODES;
        errorMessage = null;
      }

      return {
        status: false,
        message:
          AuthErrorMessages[AUTH_ERROR_CODES.SESSIONS_TERMINATION_FAILED],
        error: errorMessage,
        errorCode: errorCode,
      };
    }
  }

  /**
   * Terminates session by session_id for a given user.
   *
   * @param {ITerminateSessionRequest} data
   * @return {Promise<ITerminateSessionResponse>} Promise resolving to a response object indicating success or failure.
   */
  public async terminateSession(
    data: ITerminateSessionRequest,
  ): Promise<ITerminateSessionResponse> {
    try {
      const session = await this.sessionRepo.findOne({
        where: {
          id: data.sessionId,
          userId: data.userId,
          status: SessionStatus.ACTIVE,
        },
      });

      if (!session) {
        throw new AuthenticationError(
          AuthErrorMessages[AUTH_ERROR_CODES.SESSION_NOT_FOUND],
          AUTH_ERROR_CODES.SESSION_NOT_FOUND,
        );
      }

      await this.cacheManager.del(`auth:${session.id}`);

      session.status = SessionStatus.TERMINATED;
      await this.sessionRepo.save(session);

      return {
        status: true,
        message: 'Session terminated',
        session,
      };
    } catch (error) {
      let errorCode = AUTH_ERROR_CODES.SESSION_TERMINATION_FAILED;
      let errorMessage = error.message;

      if (error instanceof AuthenticationError) {
        errorCode = error.code as AUTH_ERROR_CODES;
        errorMessage = null;
      }

      return {
        status: false,
        message: AuthErrorMessages[AUTH_ERROR_CODES.SESSION_TERMINATION_FAILED],
        error: errorMessage,
        errorCode: errorCode,
        session: null,
      };
    }
  }

  /**
   * Verifies a token and checks the associated session.
   *
   * @param {ITokenVerifyRequest} data - Request object containing the token to verify.
   * @return {Promise<ITokenVerifyResponse>} Promise resolving to a response object indicating success or failure.
   */
  public async verifyToken(
    data: ITokenVerifyRequest,
  ): Promise<ITokenVerifyResponse> {
    try {
      let tokenData;

      try {
        tokenData = await this.jwtService.verifyAsync(data.token);
      } catch (error) {
        throw new AuthenticationError(
          AuthErrorMessages[AUTH_ERROR_CODES.INVALID_TOKEN],
          AUTH_ERROR_CODES.INVALID_TOKEN,
          { originalError: error.message },
        );
      }

      if (!tokenData?.sessionId) {
        throw new AuthenticationError(
          'Invalid token format',
          AUTH_ERROR_CODES.INVALID_TOKEN,
        );
      }

      const session = await this.findSession(tokenData.sessionId);

      if (!session) {
        throw new AuthenticationError(
          'Session not found or expired',
          AUTH_ERROR_CODES.SESSION_NOT_FOUND,
        );
      }

      const permissionsResult =
        await this.permissionClient.getPermissionsByRole(
          { roleId: session.role },
          '0000',
        );

      const permissions = permissionsResult.permissions.map(
        (k) => k.messagePattern,
      );

      const serviceJwt = await this.serviceJwtGenerator.generateServiceJwt({
        subject: session.userId,
        actor: 'auth-service',
        issuer: 'api-gateway',
        audience: 'service',
        type: 'access',
        permissions,
        expiresIn: '5m',
      });

      return {
        status: true,
        message: 'Session verified',
        user: {
          userId: session.userId,
          role: session.role,
        },
        sessionId: tokenData.sessionId,
        serviceJwt,
      };
    } catch (error) {
      let errorCode = AUTH_ERROR_CODES.TOKEN_VERIFICATION_FAILED;
      let errorMessage = error.message;

      if (error instanceof AuthenticationError) {
        errorCode = error.code as AUTH_ERROR_CODES;
        errorMessage = null;
      }

      return {
        status: false,
        message: error.message || AUTH_ERROR_CODES[errorCode],
        user: null,
        error: errorMessage,
        errorCode,
        serviceJwt: null,
        details: error.details,
      };
    }
  }

  /**
   * Refreshes a token and generates new tokens.
   *
   * @param {ITokenRefreshRequest} data - Request object containing the token to refresh.
   * @return {Promise<ITokenRefreshResponse>} Promise resolving to a response object indicating success or failure.
   */
  public async refreshToken(
    data: ITokenRefreshRequest,
  ): Promise<ITokenRefreshResponse> {
    try {
      let tokenData;

      try {
        tokenData = await this.jwtService.verifyAsync(data.token);
      } catch (error) {
        throw new AuthenticationError(
          'Token verification failed',
          AUTH_ERROR_CODES.INVALID_TOKEN,
          { originalError: error.message },
        );
      }

      if (!tokenData?.sessionId) {
        throw new AuthenticationError(
          'Invalid token format',
          AUTH_ERROR_CODES.INVALID_TOKEN,
        );
      }

      const session = await this.findSession(tokenData.sessionId);

      if (!session) {
        throw new AuthenticationError(
          'Session not found or expired',
          AUTH_ERROR_CODES.SESSION_NOT_FOUND,
        );
      }

      const { tokens } = await this.createTokens({
        userId: session.userId,
        sessionId: session.id,
      });

      return {
        status: true,
        message: 'Tokens refreshed successfully',
        tokens,
        error: null,
        errorCode: null,
      };
    } catch (error) {
      let errorCode = AUTH_ERROR_CODES.TOKEN_REFRESH_FAILED;
      let errorMessage = error.message;

      if (error instanceof AuthenticationError) {
        errorCode = error.code as AUTH_ERROR_CODES;
        errorMessage = null;
      }

      return {
        status: false,
        message: error.message || AUTH_ERROR_CODES[errorCode],
        tokens: null,
        error: errorMessage,
        errorCode,
        details: error.details,
      };
    }
  }

  /**
   * Retrieves a list of active sessions for a given user.
   *
   * @param {IActiveSessionsRequest} data - Request object containing the user ID.
   * @return {Promise<IActiveSessionsResponse>} Promise resolving to a response object containing the active sessions.
   */
  public async getActiveSessions(
    data: IActiveSessionsRequest,
  ): Promise<IActiveSessionsResponse> {
    try {
      const { userId } = data;

      const activeSessionsCount = await this.sessionRepo.count({
        where: { userId, status: SessionStatus.ACTIVE },
      });

      if (activeSessionsCount < 1) {
        throw new AuthenticationError(
          'Active sessions not found',
          AUTH_ERROR_CODES.SESSION_NOT_FOUND,
        );
      }

      const activeSessions = await this.sessionRepo.find({
        where: { userId, status: SessionStatus.ACTIVE },
      });

      return {
        message: 'Sessions found',
        status: true,
        activeSessions,
        count: activeSessionsCount,
      };
    } catch (error) {
      let errorCode = AUTH_ERROR_CODES.ACTIVE_SESSIONS_FAILED;
      let errorMessage = error.message;

      if (error instanceof AuthenticationError) {
        errorCode = error.code as AUTH_ERROR_CODES;
        errorMessage = null;
      }

      return {
        error: errorMessage,
        message: error.message,
        status: false,
        activeSessions: [],
        count: 0,
        errorCode: errorCode,
      };
    }
  }

  /**
   * Retrieves a list of sessions for a given user, including pagination.
   *
   * @param {ISessionsHistoryRequest} data - Request object containing the user ID, limit, and page.
   * @return {Promise<ISessionsHistoryResponse>} Promise resolving to a response object containing the sessions and count.
   */
  public async getSessionsHistory(
    data: ISessionsHistoryRequest,
  ): Promise<ISessionsHistoryResponse> {
    try {
      const { limit, page, userId } = data;

      const sessionsCount = await this.sessionRepo.count({
        where: { userId },
      });

      if (sessionsCount < 1) {
        throw new AuthenticationError(
          'Sessions not found',
          AUTH_ERROR_CODES.SESSION_NOT_FOUND,
        );
      }

      const sessions = await this.sessionRepo.find({
        select: [
          'id',
          'userId',
          'userIp',
          'userAgent',
          'country',
          'city',
          'fingerprint',
          'status',
        ],
        where: { userId },
        take: limit,
        skip: (page - 1) * limit,
        order: { createdAt: 'DESC' },
      });

      return {
        message: 'Sessions found',
        status: true,
        sessions,
        count: sessionsCount,
      };
    } catch (error) {
      let errorCode = AUTH_ERROR_CODES.SESSIONS_HISTORY_FAILED;
      let errorMessage = error.message;

      if (error instanceof AuthenticationError) {
        errorCode = error.code as AUTH_ERROR_CODES;
        errorMessage = null;
      }

      return {
        error: errorMessage,
        message: error.message,
        status: false,
        sessions: [],
        count: 0,
        errorCode: errorCode,
      };
    }
  }

  public async getSessionsUntilDate(
    data: ISessionUntilDateRequest,
  ): Promise<ISessionUntilDateResponse> {
    try {
      const { userId, date, limit, page } = data;

      const [sessions, count] = await Promise.all([
        this.sessionRepo.find({
          where: {
            createdAt: LessThan(date || new Date()),
            userId,
          },
          skip: ((page || 1) - 1) * (limit || 0) || 0,
          take: limit || 10,
        }),
        this.sessionRepo.count({
          where: {
            createdAt: LessThan(date),
          },
        }),
      ]);

      return {
        message: 'Get sessions until date successfully',
        status: true,
        sessions,
        count,
        error: null,
        errorCode: null,
      };
    } catch (e) {
      return {
        error: e.message,
        message: AuthErrorMessages[AUTH_ERROR_CODES.SESSIONS_UNTIL_DATE_FAILED],
        status: false,
        sessions: [],
        count: 0,
        errorCode: AUTH_ERROR_CODES.SESSIONS_UNTIL_DATE_FAILED,
      };
    }
  }

  public async deleteSessionsByIds(data: IDeleteSessionRequest): Promise<any> {
    try {
      const { ids } = data;

      await this.sessionRepo.delete({
        id: In(ids),
      });

      return {
        message: 'Sessions deleted successfully',
        status: true,
        error: null,
        errorCode: null,
      };
    } catch (e) {
      return {
        error: e.message,
        message: AuthErrorMessages[AUTH_ERROR_CODES.SESSIONS_DELETE_FAILED],
        status: false,
        errorCode: AUTH_ERROR_CODES.SESSIONS_DELETE_FAILED,
      };
    }
  }

  async #decodeToken(token: string): Promise<any> {
    try {
      const decodedData = this.jwtService.decode(token);

      if (!decodedData || decodedData.exp <= Math.floor(+new Date() / 1000)) {
        return null;
      }

      return decodedData;
    } catch (e) {
      return null;
    }
  }

  private async findSession(sessionId: string): Promise<ICachedSessionData> {
    try {
      const cacheKey = `auth:${sessionId}`;
      const cacheData = await this.cacheManager.get<ICachedSessionData>(
        cacheKey,
      );

      if (cacheData) {
        const sessionData =
          typeof cacheData === 'string' ? JSON.parse(cacheData) : cacheData;

        if (!sessionData.userId) {
          throw new AuthenticationError(
            'Invalid cached session data',
            AUTH_ERROR_CODES.SESSION_NOT_FOUND,
          );
        }

        return sessionData;
      }

      const session = await this.sessionRepo.findOne({
        where: { id: sessionId, status: SessionStatus.ACTIVE },
      });

      if (!session) {
        throw new AuthenticationError(
          'Session not found or inactive',
          AUTH_ERROR_CODES.SESSION_NOT_FOUND,
        );
      }

      const sessionData: ICachedSessionData = {
        id: session.id,
        userId: session.userId,
        userAgent: session.userAgent,
        userIp: session.userIp,
        role: session.role,
        fingerprint: session.fingerprint,
        country: session.country,
        city: session.city,
        status: session.status,
      };

      await this.cacheManager.set(
        cacheKey,
        sessionData,
        this.configService.get().auth.session_cache_ttl || 60 * 60 * 1000,
      );

      return sessionData;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }

      throw new AuthenticationError(
        'Failed to retrieve session',
        AUTH_ERROR_CODES.SESSION_NOT_FOUND,
        { originalError: error.message },
      );
    }
  }
}
