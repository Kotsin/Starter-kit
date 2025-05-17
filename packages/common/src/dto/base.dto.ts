import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty({ description: 'Response message' })
  message: string | undefined;

  @ApiProperty({ description: 'Response status' })
  status: boolean | undefined;
}
