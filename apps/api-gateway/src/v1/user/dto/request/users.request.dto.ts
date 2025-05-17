import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
export class UpdatePermissionDto {
  @ApiProperty({
    description: 'Id of user permission (endpoint)',
    example: 'f8775333-a4b4-495b-a040-2c52ab5767ef',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly permissionId!: string;

  @ApiProperty({
    description: 'Confirmation method id',
    example: 'f8775333-a4b4-495b-a040-2c52ab5767ef',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly confirmationMethodId!: number;
}

export class CreateConfirmationCodesDto {
  @ApiProperty({
    description: 'Id of user permission (endpoint)',
    example: 'f8775333-a4b4-495b-a040-2c52ab5767ef',
  })
  @IsNotEmpty()
  @IsUUID()
  readonly permissionId!: string;
}
