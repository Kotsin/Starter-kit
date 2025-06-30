import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqOptions, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  ApiKeyValidateDto,
  CreateApiKeyDto,
  IActiveSessionsRequest,
  IActiveSessionsResponse,
  IApiKeyCreateResponse,
  IApiKeyListResponse,
  IApiKeyRemoveResponse,
  INativeLogin,
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
  UpdateApiKeyDto,
} from '../../types';
import { createRmqMessage } from '../../utils';

export const AUTH_INJECT_TOKEN = 'AUTH_SERVICE';

export const loadAuthClientOptions = (): RmqOptions => {
  const { env } = process;

  const BROKER_URL = env[`AUTH_SERVICE_RMQ_URL`] as string;
  const BROKER_QUEUE = env[`AUTH_SERVICE_RMQ_QUEUE`] as string;

  return {
    transport: Transport.RMQ,
    options: {
      urls: [BROKER_URL],
      queue: BROKER_QUEUE,
      queueOptions: {
        durable: false,
      },
    },
  };
};

@Injectable()
export class AuthClient {
  constructor(
    @Inject(AUTH_INJECT_TOKEN) private readonly authClientProxy: ClientProxy,
  ) {}

  async authenticateNative(
    request: INativeLogin,
    traceId: string,
  ): Promise<any> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.AUTHENTICATE_NATIVE,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async authenticateSocial(
    request: any,
    traceId: string,
  ): Promise<ISessionCreateResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.AUTHENTICATE_NATIVE,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  /**
   * Creates a new session based on the provided request data.
   *
   * @param {ISessionCreateRequest} request
   * @param traceId
   * @return {Promise<ISessionCreateResponse>} An object with the following properties:
   */
  async sessionCreate(
    request: ISessionCreateRequest,
    traceId: string,
  ): Promise<ISessionCreateResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.SESSION_CREATE,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  /**
   * Creates and returns two types of JSON Web Tokens (JWTs): an access token and a refresh token.
   *
   * @param {ITokenCreateRequest} request
   * @param traceId
   * @return {Promise<ITokenCreateResponse>} An object with the following properties:
   */
  async tokensCreate(
    request: ITokenCreateRequest,
    traceId: string,
  ): Promise<ITokenCreateResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.TOKENS_CREATE,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  /**
   * Verifies the provided token and returns an object with the following properties:
   *
   * @param {ITokenVerifyRequest} request
   * @param traceId
   * @param isRejectDifferentIp
   * @return {Promise<ITokenVerifyResponse>} An object with the following properties:
   */
  async tokenVerify(
    request: ITokenVerifyRequest,
    traceId: string,
    isRejectDifferentIp?: boolean,
  ): Promise<ITokenVerifyResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.TOKEN_VERIFY,
        await createRmqMessage(traceId, {
          ...request,
          isRejectDifferentIp,
        }),
      ),
    );
  }

  /**
   * Refreshes the provided refresh token and returns a new access token.
   *
   * @param {ITokenRefreshRequest} request
   * @param traceId
   * @return {Promise<ITokenRefreshResponse>} An object with the following properties:
   */
  async refreshToken(
    request: ITokenRefreshRequest,
    traceId: string,
  ): Promise<ITokenRefreshResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.REFRESH_TOKEN,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  /**
   * Terminates all active sessions for a given user.
   *
   * @param traceId
   * @param {ITerminateAllRequest} request
   * @return {Promise<ITerminateAllResponse>} Promise resolving to a response object indicating success or failure.
   */
  async terminateAllSessions(
    traceId: string,
    request: ITerminateAllRequest,
  ): Promise<ITerminateAllResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.SESSION_TERMINATE_ALL,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  /**
   * Terminates all active sessions for a given user.
   *
   * @param traceId
   * @param {ITerminateAllRequest} request
   * @return {Promise<ITerminateAllResponse>} Promise resolving to a response object indicating success or failure.
   */
  async terminateSessionById(
    traceId: string,
    request: ITerminateSessionRequest,
  ): Promise<ITerminateSessionResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.SESSION_TERMINATE,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  /**
   * Returns an array of active sessions for a given user.
   *
   * @param traceId
   * @param {IActiveSessionsRequest} request
   * @param serviceToken
   * @return {Promise<IActiveSessionsResponse>} An object with the following properties:
   */
  async getActiveSessions(
    traceId: string,
    request: IActiveSessionsRequest,
    serviceToken?: string,
  ): Promise<IActiveSessionsResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.GET_ACTIVE_SESSIONS,
        await createRmqMessage(traceId, request, serviceToken),
      ),
    );
  }

  /**
   * Returns an array of session history for a given user.
   *
   * @param traceId
   * @param {ISessionsHistoryRequest} request
   * @return {Promise<ISessionsHistoryResponse>} An object with the following properties:
   */
  async getSessionsHistory(
    traceId: string,
    request: ISessionsHistoryRequest,
  ): Promise<ISessionsHistoryResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.GET_SESSIONS_HISTORY,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async getSessionsUntilDate(
    request: ISessionUntilDateRequest,
  ): Promise<ISessionUntilDateResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.GET_SESSIONS_UNTIL_DATE,
        request,
      ),
    );
  }

  async apiKeyCreate(
    request: CreateApiKeyDto,
    traceId: string,
  ): Promise<IApiKeyCreateResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.API_KEY_CREATE,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async apiKeyUpdate(
    request: { id: string; dto: UpdateApiKeyDto },
    traceId: string,
  ): Promise<IApiKeyCreateResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.API_KEY_UPDATE,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async apiKeyRemove(
    id: string,
    traceId: string,
  ): Promise<IApiKeyRemoveResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.API_KEY_DELETE,
        await createRmqMessage(traceId, id),
      ),
    );
  }

  async apiKeyList(traceId: string): Promise<IApiKeyListResponse> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.API_KEY_LIST,
        await createRmqMessage(traceId),
      ),
    );
  }

  async apiKeyValidate(
    request: ApiKeyValidateDto,
    traceId: string,
  ): Promise<{ status: boolean; message: string }> {
    return await firstValueFrom(
      this.authClientProxy.send(
        AuthClientPatterns.API_KEY_VALIDATE,
        await createRmqMessage(traceId, request),
      ),
    );
  }
}

export enum AuthClientPatterns {
  AUTHENTICATE_NATIVE = 'auth:native',
  AUTHENTICATE_SOCIAL = 'auth:social',
  SESSION_CREATE = 'session:create',
  TOKENS_CREATE = 'tokens:create',
  TOKEN_VERIFY = 'token:verify',
  REFRESH_TOKEN = 'token:refresh',
  SESSION_TERMINATE_ALL = 'session:terminate:all',
  SESSION_TERMINATE = 'session:terminate',
  GET_ACTIVE_SESSIONS = 'sessions:get:active',
  GET_SESSIONS_HISTORY = 'sessions:get:history',
  GET_SESSIONS_UNTIL_DATE = 'sessions:get:until_date',
  API_KEY_CREATE = 'api_key:create',
  API_KEY_UPDATE = 'api_key:update',
  API_KEY_DELETE = 'api_key:delete',
  API_KEY_LIST = 'api_key:get:list',
  API_KEY_VALIDATE = 'api-key:validate',
}
