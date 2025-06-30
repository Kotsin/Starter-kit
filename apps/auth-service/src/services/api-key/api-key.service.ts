import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  API_KEY_ERROR_CODES,
  ApiKeyEntity,
  apiKeyErrorMessages,
  ApiKeyType,
  CreateApiKeyDto,
  decrypt,
  encrypt,
  IApiKey,
  IDecryptedApiKey,
  UpdateApiKeyDto,
} from '@crypton-nestjs-kit/common';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';

const API_KEY_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepo: Repository<ApiKeyEntity>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async createApiKey(dto: CreateApiKeyDto): Promise<IDecryptedApiKey> {
    const rawKey = crypto.randomBytes(32).toString('hex');
    const encryptedKey = encrypt(rawKey);
    const encryptedAllowedIps = dto.allowedIps?.map((ip) => encrypt(ip)) || [];

    const now = new Date();
    const expiredAt = new Date(now.getTime() + API_KEY_TTL);

    const apiKey = this.apiKeyRepo.create({
      encryptedKey,
      type: dto.type,
      encryptedAllowedIps,
      permissions: dto.permissions,
      isActive: true,
      expiredAt,
    });

    await this.apiKeyRepo.save(apiKey);
    await this.cacheManager.set(
      `api-key-validate:${encryptedKey}`,
      { allowedIps: encryptedAllowedIps, permissions: dto.permissions },
      API_KEY_TTL,
    );

    return {
      id: apiKey.id,
      rawKey,
      type: apiKey.type as ApiKeyType,
      allowedIps: dto.allowedIps || [],
      permissions: dto.permissions || [],
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt.toISOString(),
      updatedAt: apiKey.updatedAt.toISOString(),
    };
  }

  async listApiKeys(): Promise<IApiKey[]> {
    const cacheKey = 'api-key:list';
    const cached = await this.cacheManager.get<IApiKey[]>(cacheKey);

    if (cached) return cached;

    const keys = await this.apiKeyRepo.find();
    const result = keys.map((k) => ({
      id: k.id,
      key: decrypt(k.encryptedKey),
      type: k.type as ApiKeyType,
      allowedIps: (k.encryptedAllowedIps || []).map(decrypt),
      permissions: k.permissions || [],
      isActive: k.isActive,
      expiredAt: k.expiredAt.toISOString(),
      createdAt: k.createdAt.toISOString(),
    }));

    await this.cacheManager.set(cacheKey, result, API_KEY_TTL);

    return result;
  }

  async updateApiKey(id: string, dto: UpdateApiKeyDto): Promise<IApiKey> {
    const apiKey = await this.apiKeyRepo.findOne({ where: { id } });

    if (!apiKey) {
      throw new Error(apiKeyErrorMessages[API_KEY_ERROR_CODES.NOT_FOUND]);
    }

    if (dto.isActive !== undefined) apiKey.isActive = dto.isActive;

    if (dto.allowedIps)
      apiKey.encryptedAllowedIps = dto.allowedIps.map((ip) => encrypt(ip));

    if (dto.permissions) apiKey.permissions = dto.permissions;

    await this.apiKeyRepo.save(apiKey);
    // Инвалидация кэша по id и списку
    await this.cacheManager.del(`api-key:${id}`);
    await this.cacheManager.del('api-key:list');

    // Инвалидация кэша валидации по rawKey (если нужно)
    // (rawKey не известен, но можно инвалидировать все validate:*)
    return {
      id: apiKey.id,
      key: apiKey.encryptedKey,
      type: apiKey.type as ApiKeyType,
      allowedIps: (apiKey.encryptedAllowedIps || []).map(decrypt),
      permissions: apiKey.permissions || [],
      expiredAt: apiKey.expiredAt.toISOString(),
      isActive: apiKey.isActive,
      createdAt: apiKey.createdAt.toISOString(),
    };
  }

  async deleteApiKey(
    id: string,
  ): Promise<{ status: boolean; message: string }> {
    const apiKey = await this.apiKeyRepo.findOne({ where: { id } });

    if (!apiKey) {
      throw new Error(apiKeyErrorMessages[API_KEY_ERROR_CODES.NOT_FOUND]);
    }

    await this.apiKeyRepo.delete(id);
    // Инвалидация кэша по id и списку
    await this.cacheManager.del(`api-key:${id}`);
    await this.cacheManager.del('api-key:list');

    return { status: true, message: 'API key deleted' };
  }

  async getApiKeyById(id: string): Promise<IApiKey> {
    const cacheKey = `api-key:${id}`;
    const cached = await this.cacheManager.get<IApiKey>(cacheKey);

    if (cached) return cached;

    const apiKey = await this.apiKeyRepo.findOne({ where: { id } });

    if (!apiKey) {
      throw new Error(apiKeyErrorMessages[API_KEY_ERROR_CODES.NOT_FOUND]);
    }

    const result: IApiKey = {
      id: apiKey.id,
      key: apiKey.encryptedKey,
      type: apiKey.type as ApiKeyType,
      allowedIps: (apiKey.encryptedAllowedIps || []).map(decrypt),
      permissions: apiKey.permissions || [],
      isActive: apiKey.isActive,
      expiredAt: apiKey.expiredAt.toISOString(),
      createdAt: apiKey.createdAt.toISOString(),
    };

    await this.cacheManager.set(cacheKey, result, API_KEY_TTL);

    return result;
  }

  // Валидация ключа и IP (пример)
  async validateApiKey(rawKey: string, ip: string): Promise<boolean> {
    const cacheKey = `api-key-validate:${rawKey}`;
    const cached = await this.cacheManager.get<boolean>(cacheKey);

    if (cached !== undefined) return cached;

    const allKeys = await this.apiKeyRepo.find({ where: { isActive: true } });

    for (const key of allKeys) {
      if (decrypt(key.encryptedKey) === rawKey) {
        if (!key.encryptedAllowedIps?.length) {
          await this.cacheManager.set(cacheKey, true, API_KEY_TTL);

          return true;
        }

        if (key.encryptedAllowedIps.map(decrypt).includes(ip)) {
          await this.cacheManager.set(cacheKey, true, API_KEY_TTL);

          return true;
        }
      }
    }

    await this.cacheManager.set(cacheKey, false, API_KEY_TTL);

    return false;
  }
}
