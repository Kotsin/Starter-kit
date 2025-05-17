import { Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IActiveSessionsRequest,
  IActiveSessionsResponse,
  IDeleteSessionRequest,
  IResponse,
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
  UserClient,
} from '@crypton-nestjs-kit/common';
import { ConfigService } from '@crypton-nestjs-kit/config';
import { log } from 'node:console';
import { In, LessThan, Repository } from 'typeorm';

import { SessionEntity, SessionStatus } from '../entity/session.entity';
import {
  AuthenticationError,
  AuthErrorCodes,
  ICachedSessionData,
  ISessionData,
} from '../interfaces/session.interface';

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
  ) {}
  /**
   * Creates a new session based on the provided request data.
   *
   * @param {ISessionCreateRequest} data
   * @return {Promise<ISessionCreateResponse>} An object with the following properties:
   *
   */
  public async createSession(
    data: ISessionCreateRequest,
  ): Promise<ISessionCreateResponse> {
    try {
      // Check active sessions limit
      const activeSessions = await this.sessionRepo.count({
        where: { userId: data.userId, status: SessionStatus.ACTIVE },
      });

      if (
        activeSessions >= this.configService.get().auth.max_sessions_per_user
      ) {
        throw new AuthenticationError(
          'Maximum number of active sessions reached',
          AuthErrorCodes.SESSION_LIMIT_EXCEEDED,
        );
      }

      const userResult = await this.userClient.getUserById(
        {
          user_id: data.userId,
        },
        data.traceId,
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
      if (error instanceof AuthenticationError) {
        return {
          status: false,
          message: error.message,
          sessionId: null,
        };
      }

      return {
        status: false,
        message: 'Session creation failed',
        sessionId: null,
        error: error.message,
      };
    }
  }

  /**
   * Creates and returns two types of JSON Web Tokens (JWTs): an access token and a refresh token.
   *
   * @param {ITokenCreateRequest} data
   * @return {Promise<ITokenCreateResponse>} An object with the following properties:
   */
  public async createTokens(
    data: ITokenCreateRequest,
  ): Promise<ITokenCreateResponse> {
    try {
      const jwtPayload = {
        userId: data.userId,
        sessionId: data.sessionId,
      };

      const accessToken = this.jwtService.sign(jwtPayload, {
        expiresIn: this.configService.get().auth.access_token_expires_in,
      });

      const refreshToken = this.jwtService.sign(jwtPayload, {
        expiresIn: this.configService.get().auth.refresh_token_expires_in,
      });

      return {
        status: true,
        message: 'Tokens created successfully',
        tokens: { accessToken, refreshToken },
      };
    } catch (e) {
      return {
        status: false,
        message: 'Tokens creation failed',
        tokens: null,
        error: e.message,
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
        return {
          status: false,
          message: 'No active sessions found',
        };
      }

      const sessions = await this.sessionRepo.find({
        where: { userId: data.userId, status: SessionStatus.ACTIVE },
      });

      if (sessions.length == 0) {
        return {
          status: false,
          message: 'No active sessions found',
        };
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
    } catch (e) {
      return {
        status: false,
        message: 'Sessions termination failed',
        error: e.message,
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
      console.log({
        id: data.sessionId,
        userId: data.userId,
        status: SessionStatus.ACTIVE,
      });
      const session = await this.sessionRepo.findOne({
        where: {
          id: data.sessionId,
          userId: data.userId,
          status: SessionStatus.ACTIVE,
        },
      });

      if (!session) {
        return {
          status: false,
          message: 'Session not found',
          session: null,
        };
      }

      await this.cacheManager.del(`auth:${session.id}`);

      session.status = SessionStatus.TERMINATED;
      await this.sessionRepo.save(session);

      return {
        status: true,
        message: 'Session terminated',
        session,
      };
    } catch (e) {
      return {
        status: false,
        message: 'Session termination failed',
        error: e.message,
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
          'Token verification failed',
          AuthErrorCodes.INVALID_TOKEN,
          { originalError: error.message },
        );
      }

      if (!tokenData?.sessionId) {
        throw new AuthenticationError(
          'Invalid token format',
          AuthErrorCodes.INVALID_TOKEN,
        );
      }

      const session = await this.findSession(tokenData.sessionId);

      if (!session) {
        throw new AuthenticationError(
          'Session not found or expired',
          AuthErrorCodes.SESSION_NOT_FOUND,
        );
      }

      const permissionsResult = await this.userClient.getPermissionsByRole(
        session.role,
        '0000',
      );

      return {
        status: true,
        message: 'Session verified',
        user: {
          userId: session.userId,
          role: session.role,
          permissions: permissionsResult.permissions,
        },
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return {
          status: false,
          message: error.message,
          user: null,
          details: error.details,
        };
      }

      return {
        status: false,
        message: 'Token verification failed',
        user: null,
        error: AuthErrorCodes.INVALID_TOKEN,
        details: { originalError: error.message },
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
          AuthErrorCodes.INVALID_TOKEN,
          { originalError: error.message },
        );
      }

      if (!tokenData?.sessionId) {
        throw new AuthenticationError(
          'Invalid token format',
          AuthErrorCodes.INVALID_TOKEN,
        );
      }

      const session = await this.findSession(tokenData.sessionId);

      if (!session) {
        throw new AuthenticationError(
          'Session not found or expired',
          AuthErrorCodes.SESSION_NOT_FOUND,
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
      };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return {
          status: false,
          message: error.message,
          tokens: null,
          error: error.code,
          details: error.details,
        };
      }

      return {
        status: false,
        message: 'Token refresh failed',
        tokens: null,
        error: AuthErrorCodes.INVALID_TOKEN,
        details: { originalError: error.message },
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
        return {
          message: 'Active sessions not found',
          status: false,
          activeSessions: [],
          count: 0,
        };
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
    } catch (e) {
      return {
        error: e.message,
        message: 'Active sessions not found',
        status: false,
        activeSessions: [],
        count: 0,
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
        return {
          message: 'Sessions not found',
          status: true,
          sessions: [],
          count: 0,
        };
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
    } catch (e) {
      return {
        error: e.message,
        message: 'Active sessions not found',
        status: false,
        sessions: [],
        count: 0,
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
      };
    } catch (e) {
      return {
        error: e.message,
        message: 'Get sessions until date failed',
        status: false,
        sessions: [],
        count: 0,
      };
    }
  }

  public async deleteSessionsByIds(
    data: IDeleteSessionRequest,
  ): Promise<IResponse> {
    try {
      const { ids } = data;

      await this.sessionRepo.delete({
        id: In(ids),
      });

      return {
        message: 'Sessions deleted successfully',
        status: true,
      };
    } catch (e) {
      return {
        error: e.message,
        message: 'Sessions deleted failed',
        status: false,
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
            AuthErrorCodes.SESSION_NOT_FOUND,
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
          AuthErrorCodes.SESSION_NOT_FOUND,
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
        AuthErrorCodes.SESSION_NOT_FOUND,
        { originalError: error.message },
      );
    }
  }
}
