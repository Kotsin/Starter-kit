import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SessionIdFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    const sessionId = request['sessionId'];

    if (!sessionId) {
      throw new Error('There is no sessionId in the http request!');
    }

    return sessionId;
  },
);
