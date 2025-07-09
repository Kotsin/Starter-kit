import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

import { TwoFaCodesDto } from '../../../../dto/base.dto';

// --- DTOs for 2FA Permissions Update ---

export class Permission2FAUpdate {
  @ApiProperty({
    description: 'Permission ID (endpoint)',
    example: 'f8775333-a4b4-495b-a040-2c52ab5767ef',
  })
  @IsNotEmpty()
  @IsUUID()
  permissionId!: string;

  @ApiProperty({
    description:
      'Array of confirmation method IDs for this permission. If empty, all 2FA for this permission will be removed.',
    example: ['c1e2d3f4-5678-1234-9abc-1234567890ab'],
    required: true,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  confirmationMethods!: string[];
}

export class UpdatePermissionDto {
  @ApiProperty({
    description: 'Array of permissions to update 2FA confirmation methods for',
    example: [
      {
        permissionId: 'f8775333-a4b4-495b-a040-2c52ab5767ef',
        confirmationMethods: ['c1e2d3f4-5678-1234-9abc-1234567890ab'],
      },
    ],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Permission2FAUpdate)
  readonly permissions!: Permission2FAUpdate[];

  @ApiPropertyOptional({
    description: 'Optional 2FA codes for confirmation',
    type: () => TwoFaCodesDto,
    example: {
      emailCode: 0o00000,
      phoneCode: 0o00000,
      googleCode: 0o00000,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TwoFaCodesDto)
  readonly twoFaCodes?: TwoFaCodesDto;
}

// --- DTOs for Confirmation Codes Request ---

export class CreateConfirmationCodesDto {
  @ApiProperty({
    description: 'Id of user permission (endpoint)',
    example: 'f8775333-a4b4-495b-a040-2c52ab5767ef',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly permissionId!: string;

  @ApiPropertyOptional({
    description: 'Optional 2FA codes for confirmation',
    type: () => TwoFaCodesDto,
    example: {
      emailCode: 0o00000,
      phoneCode: 0o00000,
      googleCode: 0o00000,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TwoFaCodesDto)
  readonly twoFaCodes?: TwoFaCodesDto;
}

// --- Error/Success Response DTOs ---

export class ErrorResponseDto {
  @ApiProperty({ example: false, description: 'Operation failed' })
  readonly success: false;

  @ApiProperty({ example: 'Error message', description: 'Error message' })
  readonly message: string;

  @ApiPropertyOptional({
    description: 'Error code or details',
    example: 'FORBIDDEN',
  })
  readonly error?: string;

  @ApiPropertyOptional({ description: 'Additional error data' })
  readonly data?: any;
}

export class SuccessResponseDto {
  @ApiProperty({ example: true, description: 'Operation successful' })
  readonly success: true;

  @ApiProperty({
    example: 'Operation completed',
    description: 'Success message',
  })
  readonly message: string;

  @ApiPropertyOptional({ description: 'Returned data' })
  readonly data?: any;

  @ApiProperty({
    example: Date.now(),
    description: 'Timestamp of the response',
  })
  readonly timestamp: number;

  @ApiProperty({
    example: '/v1/users/confirmations/2fa',
    description: 'Request path',
  })
  readonly path: string;

  @ApiProperty({ example: 'PATCH', description: 'HTTP method' })
  readonly method: string;
}
