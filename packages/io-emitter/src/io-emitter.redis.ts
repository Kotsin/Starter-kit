import { RedisClientType } from 'redis';
import { Inject, Injectable } from '@nestjs/common';
import { Emitter } from '@socket.io/redis-emitter';

import { IO_EMITTER_REDIS_CLIENT } from './io-emitter.constants.js';
import { IOEmitter } from './io-emitter.js';

@Injectable()
export class IOEmitterRedis extends IOEmitter {
  readonly #IOEmitter;

  constructor(@Inject(IO_EMITTER_REDIS_CLIENT) redisClient: RedisClientType) {
    super();

    this.#IOEmitter = new Emitter(redisClient);
  }

  override emitTickets(event: IOEmitter.TicketsEvent) {
    return this.#IOEmitter
      .to(super.buildTicketsRoom())
      .emit(IOEmitter.Events.TICKETS, event);
  }

  override emitMarketplace<T extends keyof IOEmitter.MarketplaceData>(
    event: IOEmitter.MarketplaceEvent<T>,
  ) {
    const user_id = event.data.user_id;

    return this.#IOEmitter
      .to(super.buildMarketplaceRoom(user_id))
      .emit(IOEmitter.Events.MARKETPLACE, event);
  }

  override emitTradeableItem<T extends keyof IOEmitter.TradeableItemEventData>(
    event: IOEmitter.TradeableItemEvent<T>,
  ) {
    const tradeable_item_type_id = event.data.tradeable_item_type_id!;

    return this.#IOEmitter
      .to(super.buildTradableItemRoom(tradeable_item_type_id))
      .emit(IOEmitter.Events.TRADEABLE_ITEM, event);
  }
}
