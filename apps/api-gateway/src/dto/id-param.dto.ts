import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class IdParamDto {
  @ApiProperty({
    required: true,
    description: 'The identifier of the resource',
    example: '77bda9f5-01d9-4c4a-90d6-116077456b84',
  })
  @IsUUID()
  @IsNotEmpty()
  @MaxLength(155)
  id!: string;
}
