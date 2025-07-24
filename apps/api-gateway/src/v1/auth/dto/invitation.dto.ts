import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'Role ID for the invited user',
    example: '4405130b-1120-402d-a6a9-cd6333520e58',
  })
  readonly invitedUserRole!: string;

  @ApiProperty({
    description: 'Expiration date for the invitation',
    example: '2024-12-31T23:59:59.000Z',
  })
  readonly expiresAt!: string;

  @ApiProperty({
    description: 'Channel for sending invitation (email or phone)',
    example: 'email',
    enum: ['email', 'phone'],
  })
  readonly channel!: 'email' | 'phone';

  @ApiProperty({
    description: 'Contact information (email address or phone number)',
    example: 'user@example.com',
  })
  readonly contact!: string;
}

export class GetInvitationsQueryDto {
  @ApiProperty({
    description: 'Filter by invitation status',
    example: 'active',
    enum: ['active', 'expired', 'used', 'cancelled'],
    required: false,
  })
  readonly status?: 'active' | 'expired' | 'used' | 'cancelled';

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  readonly page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
  })
  readonly limit?: number;
}

export class UseInvitationDto {
  @ApiProperty({
    description: 'Invitation code to use',
    example: 'ABC123DEF',
  })
  readonly code!: string;
} 