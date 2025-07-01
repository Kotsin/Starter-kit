import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RmqOptions, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { IRequest, IResponse, User } from '../../types';
import { createRmqMessage } from '../../utils';

export const USER_INJECT_TOKEN = 'USER_SERVICE';

export const loadUserClientOptions = (): RmqOptions => {
  const { env } = process;

  const BROKER_URL = env[`USER_SERVICE_RMQ_URL`] as string;
  const BROKER_QUEUE = env[`USER_SERVICE_RMQ_QUEUE`] as string;

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
export class UserClient {
  constructor(
    @Inject(USER_INJECT_TOKEN) private readonly userClientProxy: ClientProxy,
  ) {}

  async getMe(
    request: IGetMeRequest,
    traceId: string,
    serviceToken?: string,
  ): Promise<IGetMeResponse> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.GET_ME,
        await createRmqMessage(traceId, request, serviceToken),
      ),
    );
  }

  async getUserConfirmationMethods(
    request: any,
    traceId: string,
  ): Promise<any> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.GET_CONFIRMATION_METHODS,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async getUserById(
    request: IGetUserByIdRequest,
    traceId: string,
  ): Promise<IGetUserByIdResponse> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.GET_USER_BY_ID,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async getUserByLogin(
    request: IGetUserByLoginRequest,
    traceId: string,
  ): Promise<IGetUserByIdResponse> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.GET_USER_BY_LOGIN,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async getPermissionsByRole(
    request: { roleId: string; type?: string },
    traceId: string,
  ): Promise<any> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.GET_PERMISSIONS_BY_ROLE,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async getPermissionsByPattern(
    pattern: string,
    traceId: string,
  ): Promise<{ status: boolean; permission: { id: string } }> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.GET_PERMISSIONS_BY_PATTERN,
        await createRmqMessage(traceId, pattern),
      ),
    );
  }

  async findOrCreateUser(
    request: IFindOrCreateUserRequest,
    traceId: string,
  ): Promise<IFindOrCreateUserResponse> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.FIND_OR_CREATE_USER,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async registrationConfirm(
    request: IConfirmRegistrationRequest,
    traceId: string,
  ): Promise<any> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.REGISTRATION_CONFIRM,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async createConfirmationCode(
    request: ICreateConfirmationCodesRequest,
    traceId: string,
  ): Promise<ICreateConfirmationCodesResponse> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.CREATE_CONFIRMATION_CODES,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async resetConfirmationCode(
    request: { login?: string; userId?: string; id?: string },
    traceId: string,
  ): Promise<boolean> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.RESET_CONFIRMATION_CODE,
        await createRmqMessage(traceId, request),
      ),
    );
  }

  async updateTwoFaPermissions(request: any): Promise<any> {
    return await firstValueFrom(
      this.userClientProxy.send(
        UserClientPatterns.UPDATE_2FA_PERMISSIONS,
        request,
      ),
    );
  }
}

export enum UserClientPatterns {
  // --- User ---
  GET_ME = 'get_me',
  REGISTER_PERMISSIONS = 'register_permissions',
  RESET_CONFIRMATION_CODE = 'reset_confirmation_code',
  UPDATE_2FA_PERMISSIONS = 'update_2fa_permissions',
  GET_PERMISSIONS_LIST = 'get_permissions_list',
  GET_CONFIRMATION_METHODS = 'get_confirmation_methods',
  GET_USERS = 'get_users',
  GET_USER_BY_ID = 'get_user_by_id',
  GET_USER_BY_LOGIN = 'get_user_by_login',
  GET_PERMISSIONS_BY_ROLE = 'get_permissions_by_role',
  GET_PERMISSIONS_BY_PATTERN = 'get_permissions_by_pattern',
  FIND_OR_CREATE_USER = 'find_or_create_user',
  REGISTRATION_CONFIRM = 'registration_confirm',
  LOGIN_NATIVE = 'login_native',
  CREATE_CONFIRMATION_CODES = 'create_confirmation_codes',
}

// --- User ---
export interface IUser extends Partial<User> {
  login: string;
}

export interface IGetMeRequest extends IRequest {
  readonly userId: string;
}

export interface IGetMeResponse extends IResponse {
  readonly user: {
    readonly id: string;
    readonly fullName: string;
    readonly username: string;
    readonly referralCode: number;
    readonly type: string;
    readonly extraData: any;
    readonly createdAt: Date;
    readonly updatedAt: Date;
  };
}

export interface IGetUserByIdRequest extends IRequest {
  readonly userId: string;
}

export interface IGetUserByLoginRequest extends IRequest {
  readonly login: string;
}

export interface IGetUserByIdResponse extends IResponse {
  readonly user: Partial<User>;
}

export interface IFindOrCreateUserRequest extends IRequest {
  login: string;
  password: string;
  loginType: string;
  referralCode?: number;
}

export interface IConfirmRegistrationRequest extends IRequest {
  login: string;
  code: number;
}

export interface ICreateConfirmationCodesRequest extends IRequest {
  userId: string;
  permissionId: string;
}

export interface ICreateConfirmationCodesResponse extends IResponse {
  readonly confirmationMethods: string[];
}

export interface INativeLoginRequest extends IRequest {
  login: string;
  password: string;
  userAgent: string;
  userIp: string;
  fingerprint: string;
  twoFaCodes?: ITwoFaCodes;
  country?: string;
  city?: string;
}

export interface ITwoFaCodes {
  emailCode: number;
  phoneCode: number;
  googleCode: number;
}

export interface ITokens {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface INativeLoginResponse extends IResponse {
  readonly user: IUser;
  readonly tokens: ITokens;
}

export interface IFindOrCreateUserResponse extends IResponse {
  readonly user: IUser;
  readonly created?: boolean;
}

// --- ADMIN ---

export interface INotifyUsersRequest extends IRequest {
  ref_code?: number;
  dateTo: string;
  dateFrom: string;
  message: { en: string; ru: string };
  url: string;
  limit?: number;
  page?: number;
}

export type INotifyUsersResponse = IResponse;

export interface INotifyInactiveUsersRequest extends IRequest {
  id: string;
  dateFrom: string;
  dateTo: string;
  message: { en: string; ru: string };
  url: string;
}

export type INotifyInactiveUsersResponse = IResponse;
