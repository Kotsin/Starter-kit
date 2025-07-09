import { ITwoFaCodes } from '../../clients';

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

export interface IWeb3AuthCredentials {
  walletAddress: string;
  signature: string;
}

export type AuthCredentials = INativeAuthCredentials | IOAuthAuthCredentials | IWeb3AuthCredentials;

export enum AuthStrategyType {
  NATIVE = 'native',
  GOOGLE = 'google',
  APPLE = 'apple',
  TWITTER = 'twitter',
  WEB3 = 'web3',
}
