import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@crypton-nestjs-kit/common';

import { BaseDto } from './response.dto';

class UserData {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly fullName: string;

  @ApiProperty()
  readonly username: string;

  @ApiProperty()
  readonly referralCode: number;

  @ApiProperty({ enum: UserStatus })
  readonly status: UserStatus;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly extraData: any;

  @ApiProperty()
  readonly createdAt: Date;

  @ApiProperty()
  readonly updatedAt: Date;

  @ApiProperty()
  readonly deletedAt: Date;
}

export class UsersMeResponseDto extends BaseDto {
  @ApiProperty({ type: () => UserData })
  readonly user: UserData;
}
