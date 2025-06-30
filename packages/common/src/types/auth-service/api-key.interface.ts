import { IResponse } from '../response.interface';

import { ApiKeyType } from './dto/api-key.dto';

export interface IApiKey {
  id: string;
  key: string;
  type: ApiKeyType;
  allowedIps: string[];
  permissions: string[];
  isActive: boolean;
  expiredAt: string;
  createdAt: string;
}

export interface IApiKeyCreateResponse extends IResponse {
  result?: IApiKey;
}

export type IApiKeyUpdateResponse = IApiKeyCreateResponse;

export type IApiKeyRemoveResponse = IResponse;

export interface IApiKeyListResponse extends IResponse {
  result: IApiKey[];
}

export interface IDecryptedApiKey {
  id: string;
  rawKey: string;
  type: ApiKeyType;
  allowedIps: string[];
  permissions: string[];
  isActive: boolean;
  expiredAt: string;
  createdAt: string;
}
