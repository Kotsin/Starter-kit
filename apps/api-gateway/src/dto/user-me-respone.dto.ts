import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '@merchant-outline/common';

import { BaseDto } from './response.dto';

class UserData {
  @ApiProperty()
  readonly id: string;

  @ApiProperty()
  readonly full_name: string;

  @ApiProperty()
  readonly username: string;

  @ApiProperty()
  readonly referral_code: number;

  @ApiProperty({ enum: UserStatus })
  readonly status: UserStatus;

  @ApiProperty()
  readonly type: string;

  @ApiProperty()
  readonly extra_data: any;

  @ApiProperty()
  readonly created_at: Date;

  @ApiProperty()
  readonly updated_at: Date;

  @ApiProperty()
  readonly deleted_at: Date;
}

export class UsersMeResponseDto extends BaseDto {
  @ApiProperty({ type: () => UserData })
  readonly user: UserData;
}
