import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  API_KEY_ERROR_CODES,
  ApiKeyValidateDto,
  AuthClientPatterns,
  CreateApiKeyDto,
  UpdateApiKeyDto,
} from '@crypton-nestjs-kit/common';

import { ApiKeyService } from '../services/api-key/api-key.service';

@Controller()
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @MessagePattern(AuthClientPatterns.API_KEY_CREATE)
  async create(@Payload() dto: CreateApiKeyDto) {
    try {
      const result = await this.apiKeyService.createApiKey(dto);

      return {
        status: true,
        message: 'API key created',
        data: result,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
        errorCode: API_KEY_ERROR_CODES.DUPLICATE,
        error: error.message,
      };
    }
  }

  @MessagePattern(AuthClientPatterns.API_KEY_LIST)
  async list() {
    const result = await this.apiKeyService.listApiKeys();

    return {
      status: true,
      message: 'API keys list',
      data: result,
    };
  }

  @MessagePattern('api-key.get')
  async getById(@Payload() id: string) {
    try {
      const result = await this.apiKeyService.getApiKeyById(id);

      return {
        status: true,
        message: 'API key found',
        data: result,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
        errorCode: API_KEY_ERROR_CODES.NOT_FOUND,
        error: error.message,
      };
    }
  }

  @MessagePattern('api-key.update')
  async update(@Payload() data: { id: string; dto: UpdateApiKeyDto }) {
    try {
      const result = await this.apiKeyService.updateApiKey(data.id, data.dto);

      return {
        status: true,
        message: 'API key updated',
        data: result,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
        errorCode: API_KEY_ERROR_CODES.NOT_FOUND,
        error: error.message,
      };
    }
  }

  @MessagePattern('api-key.delete')
  async remove(@Payload() id: string) {
    try {
      const result = await this.apiKeyService.deleteApiKey(id);

      return {
        status: true,
        message: result.message,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
        errorCode: API_KEY_ERROR_CODES.NOT_FOUND,
        error: error.message,
      };
    }
  }

  @MessagePattern(AuthClientPatterns.API_KEY_VALIDATE)
  async validate(@Payload() data: ApiKeyValidateDto): Promise<{
    status: boolean;
    message: string;
    errorCode?: string;
    error?: string;
  }> {
    try {
      const isValid = await this.apiKeyService.validateApiKey(
        data.rawKey,
        data.ip,
      );

      return {
        status: isValid,
        message: isValid ? 'API key is valid' : 'API key is invalid',
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
        errorCode: API_KEY_ERROR_CODES.FORBIDDEN,
        error: error.message,
      };
    }
  }
}
