/**
 * Authentication response interfaces
 */

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  message: string;
  tokens?: IAuthTokens;
}

export interface IRegistrationResponse {
  message: string;
  data: {
    id?: string;
    login?: string;
    status?: string;
    [key: string]: any;
  };
}

export interface IConfirmationResponse {
  message: string;
}

export interface ISessionInfo {
  id: string;
  userAgent: string;
  userIp: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface ISessionResponse {
  sessions: ISessionInfo[];
} 