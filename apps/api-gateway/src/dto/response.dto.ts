import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class BaseDto<T = unknown> {
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

  @ApiProperty({
    example: true,
    description: 'Indicates whether the operation was successful',
  })
  @IsBoolean()
  readonly success!: boolean;

  @ApiProperty({
    example: 'User found',
    description: 'Indicates whether the operation was successful',
  })
  @IsBoolean()
  readonly message!: string;

  @ApiProperty({ description: 'Response data' })
  readonly data!: any;

  constructor(partial: Partial<BaseDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = Date.now();
  }
}
