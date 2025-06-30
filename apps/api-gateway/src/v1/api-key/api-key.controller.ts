import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AuthClient } from '@crypton-nestjs-kit/common';

import { Authorization } from '../../decorators/authorization.decorator';
import { CorrelationIdFromRequest } from '../../decorators/correlation-id-from-request.decorator';
import { UserIdFromRequest } from '../../decorators/user-id-from-request.decorator';

import {
  ApiKeyResponseDto,
  ApiKeyType,
  CreateApiKeyDto,
  UpdateApiKeyDto,
} from './api-key.dto';

@ApiTags('API Keys')
@ApiBearerAuth()
@ApiExtraModels(ApiKeyResponseDto)
@Controller('v1/api-keys')
export class ApiKeyController {
  constructor(private readonly authClient: AuthClient) {}

  /**
   * Create a new API key
   * @param dto - API key creation data
   * @returns Created API key
   */
  @Post()
  @ApiOperation({
    summary: 'Create API key',
    description: `Creates a new API key with specified type, permissions and allowed IPs.\nThe key will be shown only once after creation.`,
  })
  @ApiBody({ type: CreateApiKeyDto })
  @ApiResponse({
    status: 201,
    description: 'API key created',
    schema: { $ref: getSchemaPath(ApiKeyResponseDto) },
  })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate key' })
  @Authorization(true)
  async create(
    @Body() dto: CreateApiKeyDto,
    @CorrelationIdFromRequest() traceId: string,
    @UserIdFromRequest() userId: string,
  ) {
    const result = await this.authClient.apiKeyCreate(
      {
        type: dto.type,
        permissions: dto.permissions,
        allowedIps: dto.allowedIps,
      },
      traceId,
    );

    if (!result.status) {
      throw new HttpException(result, HttpStatus.BAD_REQUEST);
    }

    return result;
  }

  /**
   * Get all API keys
   * @returns List of API keys
   */
  @Get()
  @ApiOperation({
    summary: 'List all API keys',
    description:
      'Returns a list of all API keys with their metadata (key, type, permissions, allowed IPs, status, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of API keys',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(ApiKeyResponseDto) },
    },
  })
  async list() {
    // const result = await this.authServiceClient
    //   .send('api-key.list', {})
    //   .toPromise();
    // if (!result.status) {
    //   throw new HttpException(result, HttpStatus.BAD_REQUEST);
    // }
    //
    // return result.data;
  }

  /**
   * Get API key by ID
   * @param id - API key ID
   * @returns API key data
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get API key by ID',
    description: 'Returns API key data by its unique identifier',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'API key UUID' })
  @ApiResponse({
    status: 200,
    description: 'API key found',
    schema: { $ref: getSchemaPath(ApiKeyResponseDto) },
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async getById(@Param('id') id: string) {
    // const result = await this.authServiceClient
    //   .send('api-key.get', id)
    //   .toPromise();
    //
    // if (!result.status) {
    //   throw new HttpException(result, HttpStatus.NOT_FOUND);
    // }
    //
    // return result.data;
  }

  /**
   * Update API key
   * @param id - API key ID
   * @param dto - Update data
   * @returns Updated API key
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update API key',
    description: 'Updates API key metadata (permissions, allowed IPs, status)',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'API key UUID' })
  @ApiBody({ type: UpdateApiKeyDto })
  @ApiResponse({
    status: 200,
    description: 'API key updated',
    schema: { $ref: getSchemaPath(ApiKeyResponseDto) },
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateApiKeyDto) {
    // const result = await this.authServiceClient
    //   .send('api-key.update', { id, dto })
    //   .toPromise();
    //
    // if (!result.status) {
    //   throw new HttpException(result, HttpStatus.NOT_FOUND);
    // }
    //
    // return result.data;
  }

  /**
   * Delete API key
   * @param id - API key ID
   * @returns Deletion result
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete API key',
    description: 'Deletes API key by its unique identifier',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'API key UUID' })
  @ApiResponse({
    status: 200,
    description: 'API key deleted',
    schema: {
      example: { status: true, message: 'API key deleted' },
    },
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async remove(@Param('id') id: string) {
    // const result = await this.authServiceClient
    //   .send('api-key.delete', id)
    //   .toPromise();
    //
    // if (!result.status) {
    //   throw new HttpException(result, HttpStatus.NOT_FOUND);
    // }
    //
    // return { message: result.message };
  }
}
