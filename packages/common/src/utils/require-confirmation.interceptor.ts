import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { UserClient } from '../clients';

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
    const permissionId = this.reflector.get<string>(
      REQUIRE_CONFIRMATION_KEY,
      context.getHandler(),
    );

    if (!permissionId) {
      return next.handle();
    }

    const rpcData = context.switchToRpc().getData();

    let userId = rpcData?.userId;
    const login = rpcData?.login;
    const confirmationCodes = rpcData?.twoFaCodes;

    if (!userId && !login) {
      throw new UnauthorizedException('User data not found');
    }

    if (!userId) {
      const data = await this.userClient.getUserByLogin({ login }, '0000');

      userId = data.user.id;
    }

    const data = await this.userClient.getUserById({ user_id: userId }, '0000');

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

    console.log('confirmationMethods', confirmationMethods);

    for (const entry of confirmationMethods) {
      const method = entry?.method;

      if (!method) continue;

      const expectedCode = confirmationCodes?.[`${method}Code`];

      console.log(confirmationCodes);

      console.log(expectedCode);

      if (!expectedCode) {
        throw new UnauthorizedException(`Missing ${method} confirmation code`);
      }

      if (
        entry.code !== expectedCode ||
        new Date(entry.code_lifetime) < new Date()
      ) {
        throw new UnauthorizedException(`Invalid or expired ${method} code`);
      }
    }

    return next.handle();
  }
}
