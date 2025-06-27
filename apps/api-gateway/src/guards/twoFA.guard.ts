import { Cache } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';
import { CustomError, ExtendedHttpStatus } from '@merchant-outline/common';
import { CustomLoggerService } from '@merchant-outline/logger';
import { Request } from 'express';
import moment from 'moment';

@Injectable()
export class BaseCodeBruteForceGuard implements CanActivate {
  protected ATTEMPTS_LIMIT = 3;
  protected PENALTIES = [10, 30, 60, 300, 900, 7200];

  constructor(
    protected readonly cacheManager: Cache,
    protected readonly logger: CustomLoggerService,
  ) {}

  protected getBlockTime(attempts: number): number {
    if (attempts <= this.ATTEMPTS_LIMIT) return 0;

    return this.PENALTIES[
      Math.min(attempts - this.ATTEMPTS_LIMIT - 1, this.PENALTIES.length - 1)
    ];
  }

  protected getIdentifier(request: Request) {
    const user = request.user || {};
    const userId = user['user_id'] || user['userId'] || null;
    const ip =
      request.headers['x-forwarded-for'] || request.headers.host || request.ip;
    const login = request.body?.login;
    let identifier = `2fa:${ip}`;

    if (userId) identifier = `2fa:${userId}`;

    if (login) identifier = `2fa:${login}:${ip}`;

    return { key: identifier, userId, login, ip };
  }

  protected logBruteForceActivity(identifier: any, controller: string) {
    const details = [];

    if (identifier.userId) details.push(`UserId: ${identifier.userId}`);

    if (identifier.login) details.push(`Login: ${identifier.login}`);

    if (identifier.ip) details.push(`IP: ${identifier.ip}`);

    this.logger.warn(
      `2FA Brute force activity detected! ${details.join(
        ' ',
      )} ActivityType: [BruteForce] Controller: ${controller}`,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const controller = context.getHandler().name;

    const identifier = this.getIdentifier(request);
    const attempts = Number(await this.cacheManager.get(identifier.key)) || 0;
    const blockTime = this.getBlockTime(attempts);

    if (blockTime > 0) {
      const lastAttemptTime =
        Number(await this.cacheManager.get(`${identifier.key}:time`)) || 0;
      const now = moment().unix();

      if (now - lastAttemptTime < blockTime) {
        this.logBruteForceActivity(identifier, controller);
        const message = `Too many incorrect 2FA attempts. Try again after ${
          blockTime - (now - lastAttemptTime)
        } seconds.`;

        throw new CustomError(ExtendedHttpStatus.TOO_MANY_REQUESTS, message, {
          nextTryTime: blockTime - (now - lastAttemptTime),
        });
      }
    }

    return true;
  }

  async registerFailedAttempt(request: Request): Promise<void> {
    const identifier = this.getIdentifier(request);
    const attempts = Number(await this.cacheManager.get(identifier.key)) || 0;

    await this.cacheManager.set(identifier.key, attempts + 1, 7_200_000);
    await this.cacheManager.set(
      `${identifier.key}:time`,
      moment().unix(),
      7_200_000,
    );
  }

  async resetAttempts(request: Request): Promise<void> {
    const identifier = this.getIdentifier(request);

    await this.cacheManager.del(identifier.key);
    await this.cacheManager.del(`${identifier.key}:time`);
  }
}

export function CodeBruteForceGuardFactory(options?: {
  attemptsLimit?: number;
  penalties?: number[];
}): Type<BaseCodeBruteForceGuard> {
  class MixedBruteForceGuard extends BaseCodeBruteForceGuard {
    constructor(cacheManager: Cache, logger: CustomLoggerService) {
      super(cacheManager, logger);
      this.ATTEMPTS_LIMIT = options?.attemptsLimit ?? this.ATTEMPTS_LIMIT;
      this.PENALTIES = options?.penalties ?? this.PENALTIES;
    }
  }

  return mixin(MixedBruteForceGuard);
}
