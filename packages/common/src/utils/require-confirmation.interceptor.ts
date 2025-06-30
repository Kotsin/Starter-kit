import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';
import { Observable, of } from 'rxjs';

import { UserClient } from '../clients';
import { AUTH_ERROR_CODES } from '../errors';

import { CONTROLLER_META, ControllerType } from './controller-meta.decorator';

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
      const messagePattern = this.reflector.get<string>(
        PATTERN_METADATA,
        context.getHandler(),
      );

      const controllerMeta = this.reflector.get<{
        name: string;
        isPublic: boolean;
        description: string;
        type: string;
      }>(CONTROLLER_META, context.getHandler());

      if (
        !controllerMeta ||
        !controllerMeta.isPublic ||
        !controllerMeta.type ||
        controllerMeta.type == ControllerType.READ
      ) {
        return next.handle();
      }

      if (!messagePattern) {
        return next.handle();
      }

      const permissionData = await this.userClient.getPermissionsByPattern(
        messagePattern[0],
        '0000',
      );

      if (!permissionData.status) {
        return of({
          status: false,
          error: 'PERMISSION_DATA_NOT_FOUND',
          message: 'Permission data not found',
        });
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
        (entry: any) => entry.permission.id === permissionData.permission.id,
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

        const codeLifetime = new Date(entry.codeLifetime);
        const currentTime = new Date();

        const normalizedEntryCode = String(entry.code).trim();
        const normalizedExpectedCode = String(expectedCode).trim();

        if (normalizedEntryCode !== normalizedExpectedCode) {
          return of({
            status: false,
            error: 'INVALID_CONFIRMATION_CODE',
            message: `Invalid ${method} confirmation code`,
          });
        }

        if (currentTime.getTime() > codeLifetime.getTime()) {
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
