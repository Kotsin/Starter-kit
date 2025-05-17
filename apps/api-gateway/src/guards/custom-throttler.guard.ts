import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerRequest,
} from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context, limit, ttl, throttler, blockDuration } = requestProps;
    const { req, res } = this.getRequestResponse(context);
    const tracker = await this.getTracker(req);
    const key = this.generateKey(context, tracker);

    /**
     * You can provide own logic for this method if you need
     */
    const { totalHits, timeToExpire, isBlocked, timeToBlockExpire } =
      await this.storageService.increment(
        key,
        ttl,
        limit,
        blockDuration,
        throttler.name,
      );

    if (totalHits > limit) {
      throw new ThrottlerException();
    }

    return true;
  }
  /**
   * Use a unique identifier for each user, such as user ID or IP address
   *
   * @param {Record<string, any>} req
   * @returns {Promise<string>}
   * @protected
   */
  protected getTracker(req: Record<string, any>): Promise<string> {
    /** Send ip address */
    if (req.headers['x-forwarded-for']) {
      return req.headers['x-forwarded-for'];
    }

    if (req.headers['X-Forwarded-For']) {
      return req.headers['X-Forwarded-For'];
    }

    return req.ip;
  }

  protected getRequestResponse(context: ExecutionContext): {
    req: Record<string, any>;
    res: Record<string, any>;
  } {
    const http = context.switchToHttp();

    return { req: http.getRequest(), res: http.getResponse() };
  }

  /**
   * Generate a hashed key that will be used as a storage key.
   * The key will always be a combination of the current context and IP.
   */
  protected generateKey(context: ExecutionContext, suffix: string): string {
    const prefix = `${context.getClass().name}-${context.getHandler().name}`;

    return `${prefix}-${suffix}`;
  }
}
