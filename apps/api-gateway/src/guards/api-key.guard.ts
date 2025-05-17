import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@crypton-nestjs-kit/config';

import { API_KEY_METADATA } from '../decorators/api-key.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedApiKey =
      request.headers['x-api-key'] ||
      request.headers['api-key'] ||
      request.query.apiKey;

    const requiredKey = this.reflector.get<string>(
      API_KEY_METADATA,
      context.getHandler(),
    );

    if (!requiredKey) {
      return true;
    }

    const validApiKey = this.configService.get().secretKeys[requiredKey];

    if (!providedApiKey || providedApiKey !== validApiKey) {
      throw new ForbiddenException('Invalid API Key');
    }

    return true;
  }
}
