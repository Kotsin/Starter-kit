import {
  applyDecorators,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { BaseCodeBruteForceGuard } from '../guards/twoFA.guard';

export function Track2FAAttempt() {
  class Track2FAInterceptor implements NestInterceptor {
    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const request = context.switchToHttp().getRequest<Request>();

      const guard = context.getClass()?.prototype?.guardInstance as
        | BaseCodeBruteForceGuard
        | undefined;

      if (!guard || typeof guard.registerFailedAttempt !== 'function') {
        return next.handle();
      }

      return next.handle().pipe(
        tap(async () => {
          await guard.resetAttempts(request);
        }),
        catchError((err) => {
          guard.registerFailedAttempt(request);

          return throwError(() => err);
        }),
      );
    }
  }

  return applyDecorators(UseInterceptors(new Track2FAInterceptor()));
}
