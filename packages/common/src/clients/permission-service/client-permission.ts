import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqOptions, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { createRmqMessage } from '../../utils';

export const PERMISSION_INJECT_TOKEN = 'PERMISSION_SERVICE';

export const loadPermissionClientOptions = (): RmqOptions => {
  const { env } = process;

  const BROKER_URL = env[`PERMISSION_SERVICE_RMQ_URL`] as string;
  const BROKER_QUEUE = env[`PERMISSION_SERVICE_RMQ_QUEUE`] as string;

  return {
    transport: Transport.RMQ,
    options: {
      urls: [BROKER_URL],
      queue: BROKER_QUEUE,
      queueOptions: {
        durable: false,
      },
    },
  };
};

@Injectable()
export class PermissionClient {
  constructor(
    @Inject(PERMISSION_INJECT_TOKEN)
    private readonly permissionClientProxy: ClientProxy,
  ) {}

  async registerPermissions(request: any, traceId: string): Promise<any> {
    return await firstValueFrom(
      this.permissionClientProxy.send(
        PermisssionClientPatterns.REGISTER_PERMISSIONS,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async getPermissionList(traceId: string): Promise<any> {
    return await firstValueFrom(
      this.permissionClientProxy.send(
        PermisssionClientPatterns.GET_PERMISSIONS_LIST,
        await createRmqMessage(traceId),
      ),
    );
  }

  async getPermissionsByRole(
    request: { roleId: string; type?: string },
    traceId: string,
  ): Promise<any> {
    return await firstValueFrom(
      this.permissionClientProxy.send(
        PermisssionClientPatterns.GET_PERMISSIONS_BY_ROLE,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async getPermissionsByPattern(
    pattern: string,
    traceId: string,
  ): Promise<{ status: boolean; permission: { id: string } }> {
    return await firstValueFrom(
      this.permissionClientProxy.send(
        PermisssionClientPatterns.GET_PERMISSIONS_BY_PATTERN,
        await createRmqMessage(traceId, pattern),
      ),
    );
  }

  async updateTwoFaPermissions(request: any): Promise<any> {
    return await firstValueFrom(
      this.permissionClientProxy.send(
        PermisssionClientPatterns.UPDATE_2FA_PERMISSIONS,
        request,
      ),
    );
  }
}

export enum PermisssionClientPatterns {
  REGISTER_PERMISSIONS = 'permissions:register',
  UPDATE_2FA_PERMISSIONS = 'permissions:update',
  GET_PERMISSIONS_LIST = 'permissions:list',
  GET_PERMISSIONS_BY_ROLE = 'permissions:by:role',
  GET_PERMISSIONS_BY_PATTERN = 'permissions:by:pattern',
}
