import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ControllerMeta,
  ControllerType,
  IConfirmRegistrationRequest,
  ICreateConfirmationCodesRequest,
  ICreateConfirmationCodesResponse,
  IFindOrCreateUserRequest,
  IFindOrCreateUserResponse,
  IGetMeRequest,
  IGetMeResponse,
  IGetTwoFaPermissionsRequest,
  IGetTwoFaPermissionsResponse,
  IGetUserByIdRequest,
  IGetUserByIdResponse,
  IGetUserByLoginRequest,
  IUpdate2faPermissionsRequest,
  UserClientPatterns,
} from '@crypton-nestjs-kit/common';

import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ControllerMeta({
    name: 'Get my profile',
    description: 'Get the current user profile',
    isPublic: true,
    type: ControllerType.READ,
  })
  @MessagePattern(UserClientPatterns.GET_ME)
  public async getMe(request: IGetMeRequest): Promise<IGetMeResponse> {
    return await this.userService.getMe(request);
  }

  @ControllerMeta({
    name: 'Get confirmation methods',
    description: 'Get available user confirmation methods',
    isPublic: true,
    type: ControllerType.READ,
  })
  @MessagePattern(UserClientPatterns.GET_CONFIRMATION_METHODS)
  public async getUserConfirmationMethods(request: any): Promise<any> {
    return await this.userService.getUserConfirmationMethods(request);
  }

  @ControllerMeta({
    name: 'Reset confirmation code',
    description: 'Reset the user confirmation code',
    isPublic: false,
    type: ControllerType.WRITE,
    needsPermission: false,
  })
  @MessagePattern(UserClientPatterns.RESET_CONFIRMATION_CODE)
  public async resetConfirmationCode(
    @Payload() data: { login?: string; userId?: string; id?: string },
  ): Promise<boolean> {
    return await this.userService.resetConfirmationCode(
      data.login,
      data.userId,
      data.id,
    );
  }

  @ControllerMeta({
    name: 'Create 2FA permissions',
    description: 'Create user two-factor authentication permissions',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.CREATE_2FA_PERMISSIONS)
  public async createTwoFaPermissions(request: any): Promise<any> {
    return await this.userService.createTwoFaPermissions(request);
  }

  @ControllerMeta({
    name: 'Update 2FA permissions',
    description: 'Update user two-factor authentication permissions',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.UPDATE_2FA_PERMISSIONS)
  public async updateTwoFaPermissions(
    request: IUpdate2faPermissionsRequest,
  ): Promise<any> {
    return await this.userService.updateTwoFaPermissions(request);
  }

  @ControllerMeta({
    name: 'Get 2FA permissions list',
    description:
      'Get list of user two-factor authentication permissions with confirmation methods',
    isPublic: true,
    type: ControllerType.READ,
  })
  @MessagePattern(UserClientPatterns.GET_2FA_PERMISSIONS_LIST)
  public async getTwoFaPermissionsList(
    request: IGetTwoFaPermissionsRequest,
  ): Promise<IGetTwoFaPermissionsResponse> {
    return await this.userService.getTwoFaPermissionsList(request);
  }

  @ControllerMeta({
    name: 'Find or create user',
    description: 'Find or create a user',
    isPublic: false,
    type: ControllerType.WRITE,
    needsPermission: false,
  })
  @MessagePattern(UserClientPatterns.FIND_OR_CREATE_USER)
  public async ensureUserExists(
    data: IFindOrCreateUserRequest,
  ): Promise<IFindOrCreateUserResponse> {
    return await this.userService.ensureUserExists(data);
  }

  @ControllerMeta({
    name: 'Create confirmation codes',
    description: 'Create confirmation codes for the user',
    isPublic: true,
    type: ControllerType.WRITE,
    needsPermission: false,
  })
  @MessagePattern(UserClientPatterns.CREATE_CONFIRMATION_CODES)
  public async createConfirmationCodes(
    data: ICreateConfirmationCodesRequest,
  ): Promise<ICreateConfirmationCodesResponse> {
    return await this.userService.createConfirmationCodes(
      data.userId,
      data.permissionId,
    );
  }

  @ControllerMeta({
    name: 'Confirm registration',
    description: 'Confirm user registration',
    isPublic: false,
    type: ControllerType.WRITE,
    needsPermission: false,
  })
  @MessagePattern(UserClientPatterns.REGISTRATION_CONFIRM)
  public async registrationConfirm(
    data: IConfirmRegistrationRequest,
  ): Promise<any> {
    return await this.userService.registrationConfirm(data);
  }

  @ControllerMeta({
    name: 'Get user by ID',
    description: 'Get user by identifier',
    isPublic: false,
    type: ControllerType.READ,
  })
  @MessagePattern(UserClientPatterns.GET_USER_BY_ID)
  public async getUserById(
    data: IGetUserByIdRequest,
  ): Promise<IGetUserByIdResponse> {
    return await this.userService.getUserById(data);
  }

  @ControllerMeta({
    name: 'Get user by ID (service)',
    description: 'Get user by identifier (for services)',
    isPublic: false,
    type: ControllerType.READ,
    needsPermission: false,
  })
  @MessagePattern(UserClientPatterns.GET_USER_BY_ID_SERVICE)
  public async getUserByIdService(
    data: IGetUserByIdRequest,
  ): Promise<IGetUserByIdResponse> {
    return await this.userService.getUserById(data);
  }

  @ControllerMeta({
    name: 'Get user by login',
    description: 'Get user by login',
    isPublic: false,
    type: ControllerType.READ,
  })
  @MessagePattern(UserClientPatterns.GET_USER_BY_LOGIN)
  public async getUserByLogin(
    data: IGetUserByLoginRequest,
  ): Promise<IGetUserByIdResponse> {
    return await this.userService.getUserByLogin(data);
  }

  @ControllerMeta({
    name: 'Get user by login (secure)',
    description: 'Get user by login (secure)',
    isPublic: false,
    type: ControllerType.READ,
    needsPermission: false,
  })
  @MessagePattern(UserClientPatterns.GET_USERS_BY_LOGIN_SECURE)
  public async getUserByLoginSecure(
    data: IGetUserByLoginRequest,
  ): Promise<IGetUserByIdResponse> {
    return await this.userService.getUserByLoginSecure(data);
  }

  @ControllerMeta({
    name: 'Get permissions by role',
    description: 'Get permissions by user role',
    isPublic: true,
    type: ControllerType.READ,
    needsPermission: false,
  })
  @MessagePattern(UserClientPatterns.GET_PERMISSIONS_BY_ROLE)
  public async getPermissionsByRole(request: {
    roleId: string;
    type?: string;
  }): Promise<any> {
    return await this.userService.getPermissionsByRole(request);
  }

  @ControllerMeta({
    name: 'Get permissions by pattern',
    description: 'Get permissions by pattern',
    isPublic: false,
    type: ControllerType.READ,
    needsPermission: false,
  })
  @MessagePattern(UserClientPatterns.GET_PERMISSIONS_BY_PATTERN)
  public async getPermissionsByPattern(pattern: string): Promise<any> {
    return await this.userService.getPermissionsByPattern(pattern);
  }
}
