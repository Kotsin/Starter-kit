import { IUser } from '../../../clients';
import { IResponse } from '../../response.interface';
import { ITokensData } from '../request/auth.request.interface';

export interface ITwoFaCodes {
  email: number;
  phone: number;
}

export interface ITokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface INativeLoginResponse extends IResponse {
  readonly user: IUser;
  readonly tokens: ITokens;
}

export interface ISessionCreateResponse extends IResponse {
  sessionId: string | null;
}

export type ITerminateAllResponse = IResponse;

export interface ITerminateSessionResponse extends IResponse {
  session: ISession;
}

export interface ITokenCreateResponse extends IResponse {
  tokens: ITokensData | null;
}

export interface ITokenVerifyResponse extends IResponse {
  user: {
    userId: string;
    role: string;
    permissions?: string[];
  } | null;
  sessionId?: string;
  details?: Record<string, any>;
}

export interface ITokenRefreshResponse extends IResponse {
  tokens: ITokensData | null;
  details?: Record<string, any>;
}

export interface IActiveSessionsResponse extends IResponse {
  activeSessions: ISession[];
  count: number;
}

export interface ISessionsHistoryResponse extends IResponse {
  sessions: ISession[];
  count: number;
}

export interface ISessionUntilDateResponse extends IResponse {
  sessions: ISession[];
  count: number;
}

export interface ISessionCountResponse extends IResponse {
  count: number;
}

export interface ISession {
  id: string;
  userId: string;
  userAgent?: string;
  userIp?: string;
  country?: string;
  city?: string;
  fingerprint?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserRegistrationResponse extends IResponse {
  user?: any;
  created?: boolean;
}
