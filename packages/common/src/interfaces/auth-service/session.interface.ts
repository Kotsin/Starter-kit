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
