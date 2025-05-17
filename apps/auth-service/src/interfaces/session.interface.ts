export interface ISessionData {
  userId: string;
  userAgent?: string;
  userIp?: string;
  role: string;
  fingerprint?: string;
  country?: string;
  city?: string;
}

export interface ICachedSessionData extends ISessionData {
  id?: string;
  status?: string;
}

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>,
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export enum AuthErrorCodes {
  INVALID_TOKEN = 'AUTH_001',
  SESSION_NOT_FOUND = 'AUTH_002',
  SESSION_EXPIRED = 'AUTH_003',
  INVALID_CREDENTIALS = 'AUTH_004',
  RATE_LIMIT_EXCEEDED = 'AUTH_005',
  SESSION_LIMIT_EXCEEDED = 'AUTH_006',
  USER_NOT_FOUND = 'AUTH_007',
}
