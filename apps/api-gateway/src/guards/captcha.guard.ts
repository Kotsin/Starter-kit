import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@crypton-nestjs-kit/config';

import { CaptchaVerificationFailedException } from '../v1/auth/exceptions/auth.exceptions';
import { CaptchaService } from '../v1/auth/services/captcha.service';

@Injectable()
export class CaptchaGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly captchaService: CaptchaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    // Если CAPTCHA отключена, пропускаем проверку
    if (!this.configService.get().captcha.enabled) {
      return true;
    }

    // Проверяем наличие токена CAPTCHA
    if (!body.captcha?.token) {
      throw new CaptchaVerificationFailedException();
    }

    // Проверяем валидность токена
    const isValid = await this.captchaService.verifyToken(body.captcha.token);

    if (!isValid) {
      throw new CaptchaVerificationFailedException();
    }

    return true;
  }
}
