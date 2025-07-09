import { TimePeriod } from '../../../utils';
import { IRequest } from '../../entity-response.types';
import {
  AuthCredentials,
  INativeAuthCredentials,
} from '../auth-strategy.interface';
import { ISession } from '../response/auth.response.interface';

export interface IAuthenticateNative extends IRequest {
  credentials: AuthCredentials;
  sessionData: Partial<ISession>;
  traceId?: string;
}

// ================== 2FA / Permissions ==================
/**
 * Request to update 2FA confirmations for user permissions
 */
export interface IUpdate2faPermissionsRequest extends IRequest {
  /** User ID */
  userId: string;
  /** Array of permissions with confirmation methods */
  permissions: Array<{
    /** Permission ID */
    permissionId: string;
    /** Array of confirmation method IDs */
    confirmationMethods: string[];
  }>;
}

// ================== Sessions ==================
/**
 * Request to create a session
 */
export interface ISessionCreateRequest extends IRequest {
  userId: string;
  fingerprint: string;
  userIp: string;
  role?: string;
  userAgent?: string;
  country?: string;
  city?: string;
}

/**
 * Request to terminate all user sessions
 */
export interface ITerminateAllRequest extends IRequest {
  userId: string;
}

/**
 * Request to terminate a specific session
 */
export interface ITerminateSessionRequest extends IRequest {
  userId: string;
  sessionId: string;
}

/**
 * Request to get active user sessions
 */
export type IActiveSessionsRequest = ITerminateAllRequest;

/**
 * Request to get session history
 */
export interface ISessionsHistoryRequest extends IRequest {
  userId: string;
  page: number;
  limit: number;
}

/**
 * Request to get sessions until a specific date
 */
export interface ISessionUntilDateRequest extends IRequest {
  userId: string;
  date: Date;
  page: number;
  limit: number;
}

/**
 * Request to count sessions for a period
 */
export interface ISessionCountRequest extends IRequest {
  period: TimePeriod;
}

/**
 * Request to delete sessions by a list of IDs
 */
export interface IDeleteSessionRequest extends IRequest {
  ids: string[];
}

// ================== Tokens ==================
/**
 * Request to create a token
 */
export interface ITokenCreateRequest extends IRequest {
  userId: string;
  type?: string;
  sessionId: string;
}

/**
 * Token data (access/refresh)
 */
export interface ITokensData {
  accessToken: string;
  refreshToken: string;
}

/**
 * Request to verify a token
 */
export interface ITokenVerifyRequest
  extends Omit<ISessionCreateRequest, 'userId'> {
  token: string;
  isRejectDifferentIp?: boolean;
}

/**
 * Request to refresh a token
 */
export interface ITokenRefreshRequest extends IRequest {
  token: string;
}

// ================== Other ==================
/**
 * Request to get inactive users
 */
export interface IGetInactiveUsersRequest {
  readonly users: { id: string; tgId: string; lang: string }[];
  readonly fromDate: string;
}

/**
 * Data for native authentication
 */
export interface INativeLogin {
  credentials: INativeAuthCredentials;
  sessionData: {
    userAgent?: string;
    userIp?: string;
    fingerprint?: string;
    country?: string;
    city?: string;
  };
  traceId?: string;
}
