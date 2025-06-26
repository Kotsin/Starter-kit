import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ServiceTokenFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    const serviceToken = request['serviceToken'];

    if (!serviceToken) {
      throw new Error('There is no serviceToken in the http request!');
    }

    return serviceToken;
  },
);
