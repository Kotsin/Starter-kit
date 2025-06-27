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

export interface IDecryptedApiKey {
  id: string;
  rawKey: string;
  type: ApiKeyType;
  allowedIps: string[];
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
