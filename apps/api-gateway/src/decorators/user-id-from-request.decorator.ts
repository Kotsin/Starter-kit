import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserIdFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    const userId = request['user']?.userId;

    if (!userId) {
      throw new Error('There is no userId in the http request!');
    }

    return userId;
  },
);
