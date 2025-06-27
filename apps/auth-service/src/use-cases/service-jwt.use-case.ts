import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@merchant-outline/config';

@Injectable()
export class ServiceJwtUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Генерирует сервисный JWT токен для межсервисных запросов
   * @param payload - полезная нагрузка (например, serviceId, role и т.д.)
   * @param serviceId
   * @param options
   * @returns строка JWT
   */
  async generateServiceJwt(options: {
    payload?: Record<string, any>;
    serviceId?: string;
    userId?: string;
    permissions?: string[];
    expiresIn?: string | number;
  }): Promise<string> {
    const { serviceId, userId, permissions, expiresIn = '1m' } = options;

    const secret = this.getServiceSecret(serviceId);

    return this.jwtService.sign(
      { ...options.payload, userId, permissions, type: 'service' },
      {
        secret,
        expiresIn,
      },
    );
  }

  private getServiceSecret(serviceId: string): string {
    const secrets = this.configService.get().auth.service_secrets;

    return secrets[`${serviceId}_service`] || secrets.default;
  }
}
