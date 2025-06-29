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
    const userId = event.data.userId;

    return this.#IOEmitter
      .to(super.buildMarketplaceRoom(userId))
      .emit(IOEmitter.Events.MARKETPLACE, event);
  }

  override emitTradeableItem<T extends keyof IOEmitter.TradeableItemEventData>(
    event: IOEmitter.TradeableItemEvent<T>,
  ) {
    const tradeableItemId = (event.data as any).tradeableItemTypeId!;

    return this.#IOEmitter
      .to(super.buildTradableItemRoom(tradeableItemId))
      .emit(IOEmitter.Events.TRADEABLE_ITEM, event);
  }
}
