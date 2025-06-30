import { Cache } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CustomError, ExtendedHttpStatus } from '@crypton-nestjs-kit/common';
import { CustomLoggerService } from '@crypton-nestjs-kit/logger';
import { Request } from 'express';
import moment from 'moment';

@Injectable()
export class BruteForceGuard implements CanActivate {
  private readonly ATTEMPTS_LIMIT = 3;

  constructor(
    private readonly cacheManager: Cache,
    private readonly logger: CustomLoggerService,
  ) {}

  private getBlockTime(attempts: number): number {
    if (attempts <= this.ATTEMPTS_LIMIT) return 0;

    const penalties = [10, 30, 60, 300, 900, 7200];

    return penalties[
      Math.min(attempts - this.ATTEMPTS_LIMIT - 1, penalties.length - 1)
    ];
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const ip =
      request.headers['x-forwarded-for'] || request.headers.host || request.ip;
    const login = request.body?.login;

    if (!login) {
      throw new ForbiddenException('Missing login field');
    }

    const key = `bruteforce:${ip}:${login}`;
    const attempts = Number(await this.cacheManager.get(key)) || 0;
    const blockTime = this.getBlockTime(attempts);

    if (blockTime > 0) {
      const lastAttemptTime =
        Number(await this.cacheManager.get(`${key}:time`)) || 0;
      const now = moment().unix();

      if (now - lastAttemptTime < blockTime) {
        //TODO Send suspicious activity to XDR system
        this.logger.warn(
          'Brute force activity detected! IP: ' +
            ip +
            ' Login: ' +
            login +
            ' ActivityType: ' +
            '[BruteForce]',
        );
        const message = `Too many login attempts. Try again after ${
          blockTime - (now - lastAttemptTime)
        } seconds.`;

        throw new CustomError(ExtendedHttpStatus.TOO_MANY_REQUESTS, message, {
          nextTryTime: blockTime - (now - lastAttemptTime),
        });
      }
    }

    return true;
  }

  async registerFailedAttempt(ip: string, login: string): Promise<void> {
    const key = `bruteforce:${ip}:${login}`;
    const attempts = Number(await this.cacheManager.get(key)) || 0;

    await this.cacheManager.set(key, attempts + 1, 7_200_000);
    await this.cacheManager.set(`${key}:time`, moment().unix(), 7_200_000);
  }

  async resetAttempts(ip: string, login: string): Promise<void> {
    const key = `bruteforce:${ip}:${login}`;

    await this.cacheManager.del(key);
    await this.cacheManager.del(`${key}:time`);
  }
}
