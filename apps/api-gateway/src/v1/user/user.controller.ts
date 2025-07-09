import { Cache } from '@nestjs/cache-manager';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  acquireLock,
  ControllerType,
  CustomError,
  ExtendedHttpStatus,
  UserClient,
} from '@crypton-nestjs-kit/common';
import { RedisStore } from 'cache-manager-redis-yet';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { RedisClientType } from 'redis';
import { UsersMeResponseDto } from 'src/dto/user-me-respone.dto';

import { Authorization } from '../../decorators/authorization.decorator';
import { CorrelationIdFromRequest } from '../../decorators/correlation-id-from-request.decorator';
import { ServiceTokenFromRequest } from '../../decorators/service-token-from-request.decorator';
import { UserIdFromRequest } from '../../decorators/user-id-from-request.decorator';
import { UserRoleFromRequest } from '../../decorators/user-role-from-request';
import { PaginationQueryDto } from '../../dto/base.dto';

import { ErrorResponseDto } from './dto/request/users.request.dto';
import {
  CreateConfirmationCodesDto,
  UpdatePermissionDto,
} from './dto/request/users.request.dto';
import { TwoFaPermissionsResponseDto } from './dto/response/twofa-permissions.response.dto';

@ApiTags('User')
@Controller('v1/users')
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  private readonly redisClient: RedisClientType;
  constructor(
    private readonly userClient: UserClient,
    private readonly cacheManager: Cache,
  ) {
    this.redisClient = (this.cacheManager.store as RedisStore).client;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup user confirmation for endpoints' })
  @ApiOkResponse({
    description: 'Result of operation',
    type: UsersMeResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden or permissions not created',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    type: ErrorResponseDto,
  })
  @Authorization(true)
  @Patch('confirmations/2fa')
  async updateTwoFaConfirmation(
    @UserIdFromRequest() userId: string,
    @CorrelationIdFromRequest() traceId: string,
    @ServiceTokenFromRequest() serviceToken: string,
    @Body() body: UpdatePermissionDto,
  ): Promise<any> {
    const data = await this.userClient.updateTwoFaPermissions(
      traceId,
      serviceToken,
      {
        userId,
        permissions: body.permissions,
      },
    );

    if (!data.status) {
      return {
        success: false,
        data: data,
      };
    }

    return {
      success: true,
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Getting all of user confirmation methods' })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key. Необходим для доступа к этому эндпоинту',
    required: false,
  })
  @ApiOkResponse({
    description: 'User info',
    type: UsersMeResponseDto,
  })
  @Authorization(true)
  @Get('confirmation-methods')
  async getConfirmationsMethods(
    @UserIdFromRequest() userId: string,
    @CorrelationIdFromRequest() traceId: string,
    @ServiceTokenFromRequest() serviceToken: string,
  ): Promise<any> {
    const data = await this.userClient.getUserConfirmationMethods(
      {
        userId,
      },
      traceId,
      serviceToken,
    );

    if (!data.status) {
      throw new CustomError(
        ExtendedHttpStatus.FOUND,
        "Permissions don't created",
      );
    }

    return {
      message: 'User found',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create confirmation codes' })
  @ApiOkResponse({
    description: 'User info',
    type: UsersMeResponseDto,
  })
  @Authorization(true)
  @Post('confirmation-codes/request')
  async createConfirmationCodes(
    @UserIdFromRequest() userId: string,
    @CorrelationIdFromRequest() traceId: string,
    @ServiceTokenFromRequest() serviceToken: string,
    @Body() body: CreateConfirmationCodesDto,
  ): Promise<any> {
    const lockData = await acquireLock(
      this.redisClient,
      `createConfirmationCodes:${userId}`,
      90,
    );

    if (!lockData.status) {
      throw new CustomError(
        ExtendedHttpStatus.CONFIRMATION_CODE_SENDING_FAILED,
        'Confirmation codes sending error',
        { lockCreatedTime: lockData.lockCreatedTime },
      );
    }

    const data = await this.userClient.createConfirmationCode(
      { userId, permissionId: body.permissionId },
      traceId,
      serviceToken,
    );

    if (!data.status) {
      throw new CustomError(
        ExtendedHttpStatus.CONFIRMATION_CODE_SENDING_FAILED,
        'Confirmation codes sending error',
        { lockCreatedTime: lockData.lockCreatedTime },
      );
    }

    return {
      message: 'Confirmation codes successfully sent',
      data: {
        confirmationMethods: data.confirmationMethods,
        lockCreatedTime: lockData.lockCreatedTime,
      },
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Getting all of allowed permissions by user' })
  @ApiOkResponse({
    description: 'User info',
    type: UsersMeResponseDto,
  })
  @Authorization(true)
  @Get('allowed-permissions')
  async getAllowedPermissions(
    @UserRoleFromRequest() roleId: string,
    @CorrelationIdFromRequest() traceId: string,
    @ServiceTokenFromRequest() serviceToken: string,
  ): Promise<any> {
    const data = await this.userClient.getPermissionsByRole(
      { roleId, type: ControllerType.WRITE },
      traceId,
      serviceToken,
    );

    if (!data.status) {
      throw new CustomError(
        ExtendedHttpStatus.FORBIDDEN,
        'Permissions not found',
      );
    }

    return {
      message: 'User found',
      data,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user two-factor authentication permissions list',
    description:
      'Returns all available permissions for the user, with 2FA confirmation methods if configured. Supports pagination.',
  })
  @ApiOkResponse({
    description: 'List of 2FA permissions with confirmation methods',
    type: TwoFaPermissionsResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
    type: ErrorResponseDto,
  })
  @Authorization(true)
  @Get('2fa-permissions')
  async getTwoFaPermissionsList(
    @Query() query: PaginationQueryDto,
    @UserIdFromRequest() userId: string,
    @CorrelationIdFromRequest() traceId: string,
    @ServiceTokenFromRequest() serviceToken: string,
  ): Promise<TwoFaPermissionsResponseDto> {
    const { limit = 10, page = 1 } = query;
    const data = await this.userClient.getTwoFaPermissionsList(
      { userId, limit, page },
      traceId,
      serviceToken,
    );

    if (!data.status) {
      throw new CustomError(
        ExtendedHttpStatus.NOT_FOUND,
        'Failed to retrieve 2FA permissions',
      );
    }

    return new TwoFaPermissionsResponseDto({
      success: true,
      message: data.message,
      data: { twoFaPermissions: data.twoFaPermissions, meta: data.meta },
    });
  }

  @ApiOperation({ summary: 'Get info about user' })
  @ApiOkResponse({
    description: 'User info',
    type: UsersMeResponseDto,
  })
  @ApiBearerAuth()
  @Authorization(true)
  @Get('me')
  async getMe(
    @UserIdFromRequest() userId: string,
    @CorrelationIdFromRequest() traceId: string,
    @ServiceTokenFromRequest() serviceToken: string,
  ) {
    const userData = await this.userClient.getMe(
      {
        userId,
      },
      traceId,
      serviceToken,
    );

    if (!userData.status) {
      throw new CustomError(ExtendedHttpStatus.NOT_FOUND, 'User not found');
    }

    return new UsersMeResponseDto({
      success: true,
      message: 'User found',
      data: { user: userData.user },
    });
  }
}
