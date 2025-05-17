import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { CustomError, ExtendedHttpStatus } from './errors';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = ExtendedHttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    let errorCode = ExtendedHttpStatus.INTERNAL_SERVER_ERROR;
    let details: any = null;

    if (exception instanceof CustomError) {
      status = ExtendedHttpStatus.NOT_FOUND;
      message = exception.message;
      errorCode = exception.errorCode * 1000;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody: any = exception.getResponse();

      message = responseBody?.message || exception.message;
      errorCode = responseBody.statusCode;
    }

    const errorResponse = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      errorCode: errorCode,
      message,
      details,
    };

    response.status(status).json(errorResponse);
  }
}
