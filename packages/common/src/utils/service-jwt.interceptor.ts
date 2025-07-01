import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PATTERN_METADATA } from '@nestjs/microservices/constants';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ServiceJwtInterceptor implements NestInterceptor {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType();

    const messagePattern = this.reflector.get<string>(
      PATTERN_METADATA,
      context.getHandler(),
    );

    console.log('12313123', messagePattern);

    const { serviceToken } = this.extractContextData(context, contextType);

    // console.log('12313123', serviceToken);

    try {
      const data = this.jwtService.verify(serviceToken);

      console.log('data', data);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired service JWT token');
    }

    // if (this.shouldVerifyToken(functionType)) {
    //   if (!serviceToken) {
    //     throw new UnauthorizedException('Service JWT token is missing');
    //   }
    //
    //   try {
    //     const data = this.jwtService.verify(serviceToken);
    //
    //     console.log('data', data);
    //   } catch (err) {
    //     throw new UnauthorizedException('Invalid or expired service JWT token');
    //   }
    // }

    return next.handle().pipe(catchError((err) => throwError(() => err)));
  }

  // private shouldVerifyToken(functionType: string): boolean {
  //   return !functionType || functionType === 'WRITE';
  // }

  private extractContextData(
    context: ExecutionContext,
    contextType: string,
  ): { serviceToken: string } {
    if (contextType === 'http') {
      const request = context.switchToHttp().getRequest();

      return {
        serviceToken: request.headers['x-service-token'],
      };
    } else {
      const args = context.getArgs()[0];

      const properties = context.getArgs()[1].args[0].properties;
      const headers = properties.headers || {};
      const serviceToken =
        headers['x-service-token'] || args['x-service-token'];

      return {
        serviceToken,
      };
    }
  }
}
