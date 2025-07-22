import {
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiResponseOptions,
  ApiTags,
} from '@nestjs/swagger';
import { AuthClient } from '@crypton-nestjs-kit/common';

import { CorrelationIdFromRequest } from '../../decorators/correlation-id-from-request.decorator';
import { CheckPermissions } from '../../decorators/role-permissions-decorator';
import { ServiceTokenFromRequest } from '../../decorators/service-token-from-request.decorator';
import { UserIdFromRequest } from '../../decorators/user-id-from-request.decorator';
import { ErrorResponseDto } from '../../dto/error-response-dto';

import { ApiResponses } from './dto/auth.dto';
import {
  CreateInvitationDto,
  GetInvitationsQueryDto,
} from './dto/invitation.dto';

const InvitationApiResponses = {
  ...ApiResponses,
  ok: {
    status: 200,
    description: 'Operation completed successfully.',
    type: ErrorResponseDto,
  } as ApiResponseOptions,
  unauthorized: {
    status: 401,
    description: 'Unauthorized access.',
    type: ErrorResponseDto,
  } as ApiResponseOptions,
  forbidden: {
    status: 403,
    description: 'Access forbidden.',
    type: ErrorResponseDto,
  } as ApiResponseOptions,
};

import {
  ICancelInvitationResponse,
  ICreateInvitationRequest,
  ICreateInvitationResponse,
  IGetInvitationsRequest,
  IGetInvitationsResponse,
  IUseInvitationRequest,
  IUseInvitationResponse,
} from '@crypton-nestjs-kit/common/src/interfaces/auth-service/invitation.interface';

import { Authorization } from '../../decorators/authorization.decorator';

/**
 * Invitation Management Controller
 *
 * Handles all operations related to:
 * - Creating invitations
 * - Listing invitations with filtering and pagination
 * - Using invitations
 * - Canceling invitations
 */
@Injectable()
@ApiTags('Invitations')
@Controller('v1/auth/invitations')
export class InvitationController {
  constructor(private readonly authClient: AuthClient) {}

  /**
   * Create a new invitation
   */
  @ApiOperation({
    summary: 'Create a new invitation',
    description: `
      Creates a new invitation for user registration.
      - Generates unique invitation code
      - Sets expiration date
      - Sends invitation via specified channel (email/phone)
      
      The invitation can be used during user registration.
    `,
  })
  @ApiResponse(InvitationApiResponses.created)
  @ApiResponse(InvitationApiResponses.badRequest)
  @ApiResponse(InvitationApiResponses.unauthorized)
  @ApiResponse(InvitationApiResponses.forbidden)
  @ApiResponse(InvitationApiResponses.internalServerError)
  @ApiBearerAuth()
  @Authorization(true)
  @Post()
  async createInvitation(
    @CorrelationIdFromRequest() traceId: string,
    @UserIdFromRequest() userId: string,
    @ServiceTokenFromRequest() serviceToken: string,
    @Body() body: any,
  ): Promise<ICreateInvitationResponse> {
    const request: ICreateInvitationRequest = {
      ...body,
      createdBy: userId,
      expiresAt: new Date(body.expiresAt),
      userId,
    };

    console.log({
      request,
      traceId,
      serviceToken,
    });

    return await this.authClient.createInvitation(
      request,
      traceId,
      serviceToken,
    );
  }

  /**
   * Get list of invitations with filtering and pagination
   */
  @ApiOperation({
    summary: 'Get invitations list',
    description: `
      Retrieves a list of invitations with optional filtering and pagination.
      - Filter by status (active, expired, used, cancelled)
      - Filter by creator
      - Pagination support
      
      Returns invitations with metadata.
    `,
  })
  @ApiResponse(InvitationApiResponses.ok)
  @ApiResponse(InvitationApiResponses.unauthorized)
  @ApiResponse(InvitationApiResponses.forbidden)
  @ApiResponse(InvitationApiResponses.internalServerError)
  @ApiBearerAuth()
  @Authorization(true)
  @Get()
  async getInvitations(
    @CorrelationIdFromRequest() traceId: string,
    @ServiceTokenFromRequest() serviceToken: string,
    @UserIdFromRequest() userId: string,
    @Query() query: GetInvitationsQueryDto,
  ): Promise<IGetInvitationsResponse> {
    const request: IGetInvitationsRequest = {
      status: query.status,
      userId,
      page: query.page,
      limit: query.limit,
    };

    return await this.authClient.getInvitations(request, traceId, serviceToken);
  }

  /**
   * Cancel invitation
   */
  @ApiOperation({
    summary: 'Cancel invitation',
    description: `
      Cancels an invitation if it hasn't been used yet.
      - Validates invitation ownership
      - Checks if invitation is still active
      - Marks invitation as cancelled
      
      Only the creator can cancel their invitations.
    `,
  })
  @ApiResponse(InvitationApiResponses.ok)
  @ApiResponse(InvitationApiResponses.badRequest)
  @ApiResponse(InvitationApiResponses.notFound)
  @ApiResponse(InvitationApiResponses.unauthorized)
  @ApiResponse(InvitationApiResponses.forbidden)
  @ApiResponse(InvitationApiResponses.internalServerError)
  @ApiBearerAuth()
  @Authorization(true)
  @Delete(':id')
  async cancelInvitation(
    @CorrelationIdFromRequest() traceId: string,
    @UserIdFromRequest() userId: string,
    @ServiceTokenFromRequest() serviceToken: string,
    @Param('id') id: string,
  ): Promise<ICancelInvitationResponse> {
    return await this.authClient.cancelInvitation(
      { id, userId },
      traceId,
      serviceToken,
    );
  }
}
