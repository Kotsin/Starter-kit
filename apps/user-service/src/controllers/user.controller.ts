import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  ControllerMeta,
  ControllerType,
  FunctionType,
  IConfirmRegistrationRequest,
  ICreateConfirmationCodesRequest,
  ICreateConfirmationCodesResponse,
  IFindOrCreateUserRequest,
  IFindOrCreateUserResponse,
  IGetMeRequest,
  IGetMeResponse,
  IGetUserByIdRequest,
  IGetUserByIdResponse,
  IGetUserByLoginRequest,
  INativeLoginRequest,
  INativeLoginResponse,
  Permission,
  RequireConfirmationInterceptor,
  UserClientPatterns,
} from '@crypton-nestjs-kit/common';

import { UserService } from '../services/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ControllerMeta({
    name: 'My profile',
    description: 'My profile',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.GET_ME)
  public async getMe(request: IGetMeRequest): Promise<IGetMeResponse> {
    return await this.userService.getMe(request);
  }

  @ControllerMeta({
    name: 'Confirmation methods',
    description: 'Confirmation methods',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.GET_CONFIRMATION_METHODS)
  public async getUserConfirmationMethods(request: any): Promise<any> {
    return await this.userService.getUserConfirmationMethods(request);
  }

  @ControllerMeta({
    name: 'My profile',
    description: 'My profile',
    isPublic: true,
    type: ControllerType.WRITE,
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
    name: 'My profile',
    description: 'My profile',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.UPDATE_2FA_PERMISSIONS)
  public async updateTwoFaPermissions(request: any): Promise<any> {
    return await this.userService.updateTwoFaPermissions(request);
  }

  @ControllerMeta({
    name: 'My profile',
    description: 'My profile',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.FIND_OR_CREATE_USER)
  public async findOrCreateUser(
    data: IFindOrCreateUserRequest,
  ): Promise<IFindOrCreateUserResponse> {
    return await this.userService.findOrCreateUser(data);
  }

  @ControllerMeta({
    name: 'My profile',
    description: 'My profile',
    isPublic: true,
    type: ControllerType.WRITE,
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
    name: 'My profile',
    description: 'My profile',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.REGISTRATION_CONFIRM)
  public async registrationConfirm(
    data: IConfirmRegistrationRequest,
  ): Promise<any> {
    return await this.userService.registrationConfirm(data);
  }

  @ControllerMeta({
    name: 'My profile',
    description: 'My profile',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.GET_USER_BY_ID)
  public async getUserById(
    data: IGetUserByIdRequest,
  ): Promise<IGetUserByIdResponse> {
    return await this.userService.getUserById(data);
  }

  @ControllerMeta({
    name: 'My profile',
    description: 'My profile',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.GET_USER_BY_LOGIN)
  public async getUserByLogin(
    data: IGetUserByLoginRequest,
  ): Promise<IGetUserByIdResponse> {
    return await this.userService.getUserByLogin(data);
  }

  @ControllerMeta({
    name: 'My profile',
    description: 'My profile',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.GET_PERMISSIONS_BY_ROLE)
  public async getPermissionsByRole(request: {
    roleId: string;
    type?: string;
  }): Promise<any> {
    return await this.userService.getPermissionsByRole(request);
  }

  @ControllerMeta({
    name: 'My profile',
    description: 'My profile',
    isPublic: true,
    type: ControllerType.WRITE,
  })
  @MessagePattern(UserClientPatterns.GET_PERMISSIONS_BY_PATTERN)
  public async getPermissionsByPattern(pattern: string): Promise<any> {
    return await this.userService.getPermissionsByPattern(pattern);
  }
}
