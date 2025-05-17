import { ApiProperty, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { IOEmitter } from '../io-emitter';

export class TradeableItemOfferWSEventDto {
  @ApiProperty({ description: 'Tradeable item type id', type: () => String })
  readonly tradeable_item_type_id!: string;
}

export class TradeableItemCirculationWSEventDto {
  @ApiProperty({ description: 'Tradeable item type id', type: () => String })
  readonly tradeable_item_type_id!: string;

  @ApiProperty({ description: 'Listed total', type: () => Number })
  readonly listed_total!: number;

  @ApiProperty({ description: 'In circulation', type: () => Number })
  readonly in_circulation!: number;
}

export class TradeableItemHistoryWSEventDto {
  @ApiProperty({ description: 'Tradeable item type id', type: () => String })
  readonly tradeable_item_type_id!: string;

  @ApiProperty({ description: 'Amount', type: () => Number })
  readonly amount!: number;

  @ApiProperty({ description: 'Price', type: () => Number })
  readonly price!: number;

  @ApiProperty({ description: 'Updated at', type: () => Date })
  readonly updated_at!: Date;

  @ApiProperty({ description: 'Buyer username', type: () => String })
  readonly buyer_username!: string;

  @ApiProperty({ description: 'Buyer full name', type: () => String })
  readonly buyer_full_name!: string;
}

export class TradeableItemPriceLevelsWSEventDto {
  @ApiProperty({ description: 'Tradeable item type id', type: () => String })
  readonly tradeable_item_type_id!: string;

  @ApiProperty({ description: 'Price levels', type: () => Object })
  readonly price_levels!: any;
}

@ApiExtraModels(
  TradeableItemOfferWSEventDto,
  TradeableItemHistoryWSEventDto,
  TradeableItemCirculationWSEventDto,
  TradeableItemPriceLevelsWSEventDto,
)
export class TradeableItemWSEvent {
  @ApiProperty({
    description: 'Event type',
    enum: IOEmitter.TradeableItemEvents,
    enumName: 'TradeableItemEvents',
  })
  readonly type!: IOEmitter.TradeableItemEvents;

  @ApiProperty({
    description: 'Event data',
    oneOf: [
      { $ref: getSchemaPath(TradeableItemOfferWSEventDto) },
      { $ref: getSchemaPath(TradeableItemHistoryWSEventDto) },
      { $ref: getSchemaPath(TradeableItemCirculationWSEventDto) },
      { $ref: getSchemaPath(TradeableItemPriceLevelsWSEventDto) },
    ],
    required: false,
    type: () => Object,
  })
  readonly data!: IOEmitter.TicketEventsData;
}
