import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RequestIpFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    return (
      request.headers['x-forwarded-for'] || request.headers.host || request.ip
    );
  },
);
