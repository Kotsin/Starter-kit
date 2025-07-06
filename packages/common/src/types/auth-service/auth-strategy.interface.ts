import { ITwoFaCodes } from './response/auth.response.interface';

export interface IAuthStrategy {
  authenticate?: (credentials: any, traceId?: string) => Promise<IAuthResult>;
  validateToken(token: string): Promise<IAuthResult>;
}

export interface IAuthResult {
  status: boolean;
  user?: {
    id: string;
    fullName?: string;
  };
  error?: string;
  errorCode?: string;
}

export interface INativeAuthCredentials {
  login: string;
  loginType: string;
  password: string;
  twoFaCodes?: ITwoFaCodes;
}

export interface IOAuthAuthCredentials {
  provider: string;
  accessToken: string;
  refreshToken?: string;
}

export type AuthCredentials = INativeAuthCredentials | IOAuthAuthCredentials;

export enum AuthStrategyType {
  NATIVE = 'native',
  GOOGLE = 'google',
  APPLE = 'apple',
  TWITTER = 'twitter',
}
