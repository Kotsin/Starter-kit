import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const routePath = this.reflector.get<string>('path', context.getHandler());
    const method = request.method;
    const user = request['user'];

    const checkPermissions = this.reflector.get<boolean>(
      'checkPermissions',
      context.getHandler(),
    );

    if (checkPermissions === false || !user) {
      return true;
    }

    const controllerPath =
      Reflect.getMetadata('path', context.getClass()) || '';
    const fullPath = `/${controllerPath}/${routePath}`.replace(/\/+/g, '/');

    const isAccessAllowed = user.permissions.some((item) => {
      return item.method === method && item.route === fullPath;
    });

    return isAccessAllowed;
  }
}
