import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CorrelationIdFromRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();

    const trace_id = request['correlationId'] || null;

    return trace_id;
  },
);
