import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserRoleFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    const userRole = request['user']?.role;

    if (!userRole) {
      throw new Error('There is no userId in the http request!');
    }

    return userRole;
  },
);
