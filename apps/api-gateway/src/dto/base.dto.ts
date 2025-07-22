import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class TwoFaCodesDto {
  @ApiProperty({
    description: 'Email 2fa code if security mode setups',
    example: 0o00000,
  })
  @IsOptional()
  @IsNumber()
  readonly email!: number;

  @ApiProperty({
    description: 'Phone 2fa code if security mode setups',
    example: 0o00000,
  })
  @IsOptional()
  @IsNumber()
  readonly phone!: number;
}

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;
}
