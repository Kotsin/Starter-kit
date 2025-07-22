import { ApiKeyType } from '../../enums';
import { IRequest } from '../entity-response.types';
import { IResponse } from '../response.interface';

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

export interface ICreateApiKeyData extends IRequest {
  userId?: string;
  type: ApiKeyType | undefined;
  allowedIps?: string[];
  permissions?: string[];
}

export interface IUpdateApiKeyData extends IRequest {
  type?: string;
  isActive?: boolean;
  allowedIps?: string[];
  permissions?: string[];
}

export interface IApiKeyValidateData extends IRequest {
  rawKey: string;
  ip: string;
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
