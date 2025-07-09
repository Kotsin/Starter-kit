import { ApiProperty } from '@nestjs/swagger';
import { ControllerType, LoginMethod } from '@crypton-nestjs-kit/common';

import { BaseDto } from '../../../../dto/response.dto';

/**
 * DTO for confirmation method information
 */
export class ConfirmationMethodDto {
  @ApiProperty({
    description: 'Unique identifier of the confirmation method',
    example: 'c1e2d3f4-5678-1234-9abc-1234567890ab',
  })
  readonly id: string;

  @ApiProperty({
    description: 'Type of confirmation method',
    enum: LoginMethod,
    example: LoginMethod.EMAIL,
  })
  readonly method: LoginMethod;
}

/**
 * DTO for two-factor authentication permission information
 */
export class TwoFaPermissionDto {
  @ApiProperty({
    description: 'Unique identifier of the permission',
    example: 'f8775333-a4b4-495b-a040-2c52ab5767ef',
  })
  readonly id: string;

  @ApiProperty({
    description: 'HTTP method (GET, POST, PUT, DELETE)',
    example: 'POST',
  })
  readonly method: string;

  @ApiProperty({
    description: 'Human-readable alias for the permission',
    example: 'Create API Key',
  })
  readonly alias: string;

  @ApiProperty({
    description: 'Detailed description of the permission',
    example: 'Allows user to create new API keys',
  })
  readonly description: string;

  @ApiProperty({
    description: 'Controller type (READ, WRITE, etc.)',
    enum: ControllerType,
    example: ControllerType.WRITE,
  })
  readonly type: ControllerType;

  @ApiProperty({
    description: 'Available confirmation methods for this permission',
    type: [ConfirmationMethodDto],
  })
  readonly confirmationMethods: ConfirmationMethodDto[];
}

export class TwoFaPermissionsMetaDto {
  @ApiProperty({ example: 100 })
  total: number;
  @ApiProperty({ example: 1 })
  page: number;
  @ApiProperty({ example: 20 })
  limit: number;
}

/**
 * DTO for response containing user's 2FA permissions list
 */
export class TwoFaPermissionsResponseDto extends BaseDto {
  @ApiProperty({
    description: 'Array of 2FA permissions with their confirmation methods',
    type: [TwoFaPermissionDto],
  })
  readonly data: TwoFaPermissionDto[];

  @ApiProperty({
    description: 'Pagination meta',
    type: TwoFaPermissionsMetaDto,
  })
  readonly meta: TwoFaPermissionsMetaDto;
}
