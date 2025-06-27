import {
  ApiProperty,
  ApiExtraModels,
  getSchemaPath,
  PickType,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IOEmitter } from '../io-emitter';
import { UserOperationStatusEnum } from '@merchant-outline/common';

class BaseMarketplaceWSEventDto {
  @ApiProperty({ description: 'User id', type: () => String })
  readonly user_id!: string;

  @ApiProperty({ description: 'User operation id', type: () => String })
  readonly user_operation_id!: string;

  @ApiProperty({
    description: `Status '${UserOperationStatusEnum.COMPLETED}' or '${UserOperationStatusEnum.FAILED}'`,
    type: () => String,
    enum: [UserOperationStatusEnum.COMPLETED, UserOperationStatusEnum.FAILED],
    enumName: 'UserOperationStatusEnum',
  })
  readonly status!:
    | UserOperationStatusEnum.COMPLETED
    | UserOperationStatusEnum.FAILED;
}

export class MarketplaceMakeTradeableWSEventDto extends BaseMarketplaceWSEventDto {}

export class MarketplaceListingWSEventDto extends BaseMarketplaceWSEventDto {}

export class MarketplaceUpdateWSEventDto extends BaseMarketplaceWSEventDto {}

export class MarketplaceCancelWSEventDto extends BaseMarketplaceWSEventDto {}

export class MarketplaceBuyWSEventDto extends PickType(
  BaseMarketplaceWSEventDto,
  ['user_operation_id', 'status'] as const,
) {
  @ApiProperty({ description: 'Buyer user id', type: () => String })
  readonly user_id!: string;

  @ApiPropertyOptional({ description: 'Amount', type: () => Number })
  readonly amount?: number;

  @ApiPropertyOptional({ description: 'Price', type: () => Number })
  readonly price?: number;
}

export class MarketplaceSellWSEventDto extends PickType(
  BaseMarketplaceWSEventDto,
  ['user_operation_id', 'status'] as const,
) {
  @ApiProperty({ description: 'Seller user id', type: () => String })
  readonly user_id!: string;

  @ApiPropertyOptional({ description: 'User operation id', type: () => Number })
  readonly amount?: number;
}

@ApiExtraModels(
  MarketplaceMakeTradeableWSEventDto,
  MarketplaceListingWSEventDto,
  MarketplaceUpdateWSEventDto,
  MarketplaceCancelWSEventDto,
  MarketplaceBuyWSEventDto,
  MarketplaceSellWSEventDto,
)
export class MarketplaceWSEvent {
  @ApiProperty({
    description: 'Event type',
    enum: IOEmitter.MarketplaceEvents,
    enumName: 'MarketplaceEvents',
  })
  readonly type!: IOEmitter.MarketplaceEvents;

  @ApiProperty({
    description: 'Event data',
    oneOf: [
      { $ref: getSchemaPath(MarketplaceMakeTradeableWSEventDto) },
      { $ref: getSchemaPath(MarketplaceListingWSEventDto) },
      { $ref: getSchemaPath(MarketplaceCancelWSEventDto) },
      { $ref: getSchemaPath(MarketplaceSellWSEventDto) },
      { $ref: getSchemaPath(MarketplaceBuyWSEventDto) },
      { $ref: getSchemaPath(MarketplaceSellWSEventDto) },
    ],
    required: false,
    type: () => Object,
  })
  readonly data!: IOEmitter.MarketplaceData;
}
