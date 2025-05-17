import { ApiProperty } from '@nestjs/swagger';

export class GetSocketConnectionResponseDto {
  @ApiProperty({ example: true, description: 'Status of the request' })
  readonly status: boolean;

  @ApiProperty({ description: 'Message about the status of request' })
  readonly message: string;

  @ApiProperty({ description: 'Socket connection' })
  readonly connection: string;
}
