import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@merchant-outline/common';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: UserType,
    enumName: 'UserRole',
  })
  role: UserType;

  @ApiProperty()
  login: string;
}
