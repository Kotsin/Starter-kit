import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthClient } from '@merchant-outline/common';

import { Authorization } from '../../decorators/authorization.decorator';
import { CorrelationIdFromRequest } from '../../decorators/correlation-id-from-request.decorator';
import { ServiceTokenFromRequest } from '../../decorators/service-token-from-request.decorator';
import { UserIdFromRequest } from '../../decorators/user-id-from-request.decorator';
import { RolesGuard } from '../../guards/role.guard';

import {
  GetSessionsHistoryDto,
  SessionResponseDto,
  TerminateSessionDto,
} from './dto/session.dto';

@ApiTags('Sessions')
@Controller('v1/auth/sessions')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class SessionsController {
  constructor(private readonly authClient: AuthClient) {}

  @ApiOperation({
    summary: 'Get active sessions',
    description: 'Returns a list of all active sessions for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active sessions',
    type: SessionResponseDto,
  })
  @Authorization(true)
  @Get('active')
  async getActiveSessions(
    @CorrelationIdFromRequest() traceId: string,
    @UserIdFromRequest() userId: string,
    @ServiceTokenFromRequest() serviceToken: string,
  ): Promise<SessionResponseDto> {
    console.log('asdasda');
    const sessions = await this.authClient.getActiveSessions(
      traceId,
      {
        userId,
      },
      serviceToken,
    );

    return {
      sessions: sessions.activeSessions,
      message: 'Sessions found',
      count: sessions.count,
    };
  }

  @ApiOperation({
    summary: 'Get sessions history',
    description: 'Returns a list of all sessions with optional date filtering',
  })
  @ApiResponse({
    status: 200,
    description: 'Session history',
    type: SessionResponseDto,
  })
  @Authorization(true)
  @Get('history')
  async getSessionsHistory(
    @CorrelationIdFromRequest() traceId: string,
    @UserIdFromRequest() userId: string,
    @Query() query: GetSessionsHistoryDto,
  ): Promise<SessionResponseDto> {
    const { page = 1, limit = 10 } = query;

    const sessionsData = await this.authClient.getSessionsHistory(traceId, {
      page,
      limit,
      userId,
      traceId,
    });

    return {
      sessions: sessionsData.sessions,
      count: sessionsData.count,
      message: 'Session history found',
    };
  }

  @ApiOperation({
    summary: 'Terminate session',
    description: 'Terminates a specific session by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Session successfully terminated',
  })
  @Authorization(true)
  @Delete('terminate')
  async terminateSession(
    @CorrelationIdFromRequest() traceId: string,
    @UserIdFromRequest() userId: string,
    @Body() body: TerminateSessionDto,
  ): Promise<{ message: string }> {
    await this.authClient.terminateSessionById(traceId, {
      userId,
      sessionId: body.sessionId,
    });

    return { message: 'Session terminated successfully' };
  }

  @ApiOperation({
    summary: 'Terminate all sessions',
    description: 'Terminates all active sessions for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'All sessions terminated successfully',
  })
  @Authorization(true)
  @Delete('terminate/all')
  async terminateAllSessions(
    @CorrelationIdFromRequest() traceId: string,
    @UserIdFromRequest() userId: string,
  ): Promise<{ message: string }> {
    await this.authClient.terminateAllSessions(traceId, { userId });

    return { message: 'All sessions terminated successfully' };
  }
}
