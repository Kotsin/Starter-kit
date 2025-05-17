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
      console.log('asdqweqwd');
      const request = context.switchToHttp().getRequest<Request>();

      const guard = context.getClass()?.prototype?.guardInstance as
        | BaseCodeBruteForceGuard
        | undefined;

      if (!guard || typeof guard.registerFailedAttempt !== 'function') {
        console.log('asdasdasdase123123123', guard);

        return next.handle(); // нет guardInstance — просто продолжаем
      }

      return next.handle().pipe(
        tap(async () => {
          console.log('resetAttempts');
          await guard.resetAttempts(request);
        }),
        catchError((err) => {
          console.log('registerFailedAttempt');
          guard.registerFailedAttempt(request);

          return throwError(() => err);
        }),
      );
    }
  }

  return applyDecorators(UseInterceptors(new Track2FAInterceptor()));
}
