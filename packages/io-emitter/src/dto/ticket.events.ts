import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IOEmitter } from '../io-emitter';

export class TicketCirculationWSEventDto {
  @ApiProperty({ description: 'Ticket id', type: () => String })
  readonly id!: string;

  @ApiProperty({ description: 'Circulation', type: () => Number })
  readonly circulation!: number;
}

@ApiExtraModels(TicketCirculationWSEventDto)
export class TicketWSEvent {
  @ApiProperty({
    description: 'Event type',
    enum: IOEmitter.TicketEvents,
    enumName: 'TicketEvents',
  })
  readonly type!: IOEmitter.TicketEvents;

  @ApiProperty({
    description: 'Event data',
    oneOf: [{ $ref: getSchemaPath(TicketCirculationWSEventDto) }],
    required: false,
    type: () => Object,
  })
  readonly data!: IOEmitter.TicketEventsData;
}
