import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from './response.dto';

export class UsersExperienceResponseDto extends BaseDto {
  @ApiProperty()
  experience: number;
}
