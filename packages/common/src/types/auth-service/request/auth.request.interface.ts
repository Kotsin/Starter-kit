import { TimePeriod } from '../../../utils';
import { IRequest } from '../../entity-response.types';

export interface IGetInactiveUsersRequest {
  readonly users: { id: string; tgId: string; lang: string }[];
  readonly fromDate: string;
}

export interface ISessionCreateRequest extends IRequest {
  userId: string;
  fingerprint: string;
  userIp: string;
  role?: string;
  userAgent?: string;
  country?: string;
  city?: string;
}

export interface ITerminateAllRequest extends IRequest {
  userId: string;
}

export interface ITerminateSessionRequest extends IRequest {
  userId: string;
  sessionId: string;
}

export type IActiveSessionsRequest = ITerminateAllRequest;

export interface ISessionsHistoryRequest extends IRequest {
  userId: string;
  page: number;
  limit: number;
}

export interface ITokenCreateRequest extends IRequest {
  userId: string;
  type?: string;
  sessionId: string;
}

export interface ITokensData {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenVerifyRequest
  extends Omit<ISessionCreateRequest, 'userId'> {
  token: string;
  isRejectDifferentIp?: boolean;
}

export interface ITokenRefreshRequest extends IRequest {
  token: string;
}

export interface ISessionUntilDateRequest extends IRequest {
  userId: string;
  date: Date;
  page: number;
  limit: number;
}

export interface ISessionCountRequest extends IRequest {
  period: TimePeriod;
}

export interface IDeleteSessionRequest extends IRequest {
  ids: string[];
}
