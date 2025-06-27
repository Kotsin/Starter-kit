import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ErrorResponseDto {
  @ApiProperty({
    example: new Date().getTime(),
    description: 'Timestamp of the response',
  })
  @IsNumber()
  readonly timestamp!: number;

  @ApiProperty({
    example: 'api/v1/auth/signup',
    description: 'Path of the request',
  })
  readonly path!: string;

  @ApiProperty({ example: 'POST', description: 'HTTP method of the request' })
  readonly method!: string;

  @ApiProperty({ example: 404, description: 'Application-specific error code' })
  readonly errorCode!: number;

  @ApiProperty({ description: 'Human-readable error message' })
  readonly message!: string[];

  @ApiProperty({
    description: 'Additional details about the error',
    required: false,
  })
  readonly details?: any;

  constructor(partial: Partial<ErrorResponseDto>) {
    Object.assign(this, partial);
  }
}
