import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';

import { UserClient } from '../clients';
import { AUTH_ERROR_CODES } from '../errors';

import { REQUIRE_CONFIRMATION_KEY } from './require-confirmation.decorator';

@Injectable()
export class RequireConfirmationInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly userClient: UserClient,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    try {
      const permissionId = this.reflector.get<string>(
        REQUIRE_CONFIRMATION_KEY,
        context.getHandler(),
      );

      if (!permissionId) {
        return next.handle();
      }

      const rpcData = context.switchToRpc().getData();

      let userId = rpcData?.userId;
      const login = rpcData?.credentials?.login;
      const confirmationCodes =
        rpcData?.twoFaCodes || rpcData?.credentials?.twoFaCodes;

      if (!userId && !login) {
        return of({
          status: false,
          error: 'USER_DATA_NOT_FOUND',
          message: 'User data not found',
        });
      }

      if (!userId) {
        const data = await this.userClient.getUserByLogin({ login }, '0000');
        userId = data.user.id;
      }

      const data = await this.userClient.getUserById({ userId }, '0000');

      const twoFaEntries = data.user.twoFaPermissions.filter(
        (entry: any) => entry.permission.id === permissionId,
      );

      const confirmationMethods = data.user.loginMethods.filter((entry: any) =>
        twoFaEntries.some(
          (twoFaMethod: any) => twoFaMethod.confirmationMethod?.id === entry.id,
        ),
      );

      if (confirmationMethods.length < 0) {
        return next.handle();
      }

      for (const entry of confirmationMethods) {
        const method = entry?.method;
        if (!method) continue;
        const expectedCode = confirmationCodes?.[`${method}Code`];
        if (!expectedCode) {
          return of({
            status: false,
            error: 'MISSING_CONFIRMATION_CODE',
            message: `Missing ${method} confirmation code`,
          });
        }

        const codeLifetime = new Date(entry.code_lifetime);
        const currentTime = new Date();

        const normalizedEntryCode = String(entry.code).trim();
        const normalizedExpectedCode = String(expectedCode).trim();

        if (
          normalizedEntryCode !== normalizedExpectedCode
        ) {
          return of({
            status: false,
            error: 'INVALID_CONFIRMATION_CODE',
            message: `Invalid ${method} confirmation code`,
          });
        }

        if (
          currentTime.getTime() > codeLifetime.getTime()
        ) {
          return of({
            status: false,
            error: 'EXPIRED_CONFIRMATION_CODE',
            message: `Expired ${method} confirmation code`,
          });
        }

        await this.userClient.resetConfirmationCode({ id: entry.id }, '0000');
      }

      return next.handle();
    } catch (err) {
      return of({
        status: false,
        error: null,
        message: (err as Error).message,
        errorCode: AUTH_ERROR_CODES.UNKNOWN_ERROR,
      });
    }
  }
}
