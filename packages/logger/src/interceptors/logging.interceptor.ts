import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { SENSITIVE_FIELDS } from '@merchant-outline/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CustomLoggerService } from '../logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(CustomLoggerService)
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('LoggingInterceptor');
  }
  private readonly sensitiveFields = SENSITIVE_FIELDS;

  intercept(
    executionContext: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const now = Date.now();
    const contextType = executionContext.getType();
    const handlerName = executionContext.getHandler().name;
    const className = executionContext.getClass().name;

    const { traceId, args } = this.extractContextData(
      executionContext,
      contextType,
    );
    const sanitizedArgs = this.sanitizeSensitiveData(args);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - now;
        const logMessage = this.buildLogMessage(
          traceId,
          handlerName,
          sanitizedArgs,
          data,
          duration,
        );

        if (data?.error) {
          this.logger.error(logMessage, className);
        } else {
          this.logger.log(logMessage, className);
        }
      }),
    );
  }

  private extractContextData(
    context: ExecutionContext,
    contextType: string,
  ): { traceId: string; args: any } {
    if (contextType === 'http') {
      const request = context.switchToHttp().getRequest();

      return {
        traceId: request.correlationId,
        args: request.body,
      };
    } else {
      const args = context.getArgs()[0];

      const properties = context.getArgs()[1].args[0].properties;
      const headers = properties.headers || {};
      const traceId = headers.traceId || args?.traceId;

      return {
        traceId: traceId,
        args,
      };
    }
  }

  private sanitizeSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sanitizedData: { [key: string]: any } = Array.isArray(data) ? [] : {};

    for (const key in data) {
      if (this.sensitiveFields.includes(key.toLowerCase())) {
        sanitizedData[key] = '***';
      } else {
        sanitizedData[key] = this.sanitizeSensitiveData(data[key]);
      }
    }

    return sanitizedData;
  }

  private buildLogMessage(
    traceId: string,
    handlerName: string,
    args: any,
    data: any,
    duration: number,
  ): string {
    let message = `trace: ${traceId} handler: ${handlerName} status: ${
      data.status
    } data: ${JSON.stringify(args)}`;

    if (!data?.status) {
      message += ` message: ${JSON.stringify(data.message)}`;
    }

    if (data?.service_meta) {
      message += ` service_meta: ${JSON.stringify(data.service_meta)}`;
    }

    if (data?.error) {
      message += ` error: ${data.error}`;
    }

    message += ` duration: ${duration}ms`;

    return message;
  }
}
