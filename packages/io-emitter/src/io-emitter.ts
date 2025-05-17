import {
  TicketCirculationWSEventDto,
  TradeableItemCirculationWSEventDto,
  TradeableItemHistoryWSEventDto,
  TradeableItemOfferWSEventDto,
  TradeableItemPriceLevelsWSEventDto,
} from './dto';
import {
  MarketplaceMakeTradeableWSEventDto,
  MarketplaceListingWSEventDto,
  MarketplaceUpdateWSEventDto,
  MarketplaceCancelWSEventDto,
  MarketplaceBuyWSEventDto,
  MarketplaceSellWSEventDto,
} from './dto/marketplace.events';

/**
 * Redis socket.io emitter that allows sending packets to connected clients through redis socket.io adapter
 *
 * https://socket.io/docs/v4/redis-adapter/#emitter
 */
export abstract class IOEmitter {
  /**
   * Returns ticket room
   *
   * @returns ticket room string
   */
  buildTicketsRoom(): string {
    return IOEmitter.Events.TICKETS;
  }

  /**
   * Returns tradable item room
   * @param tradeable_item_id - tradeable item id
   * @returns tradable item room string
   */
  buildTradableItemRoom(tradeable_item_id: string): string {
    return `${IOEmitter.Events.TRADEABLE_ITEM}:${tradeable_item_id}`;
  }

  /** Return user marketplace room
   *
   * @param user_id - user id
   * @returns user marketplace room string
   */
  buildMarketplaceRoom(user_id: string): string {
    return `${IOEmitter.Events.MARKETPLACE}:${user_id}`;
  }

  /**
   * Emits an event for tickets.
   *
   * @param data - The data for the ticket event. See {@link IOEmitter.TicketsEvent}.
   */
  abstract emitTickets(data: IOEmitter.TicketsEvent): void;

  /**
   * Emits an event for tradeable items.
   *
   * @param data - The data for the tradeable item event. See {@link IOEmitter.TradeableItemEvent}.
   */
  abstract emitTradeableItem<T extends keyof IOEmitter.TradeableItemEventData>(
    data: IOEmitter.TradeableItemEvent<T>,
  ): void;

  /** Emits an event for marketplace.
   *
   * @param data - The data for the marketplace event. See {@link IOEmitter.MarketplaceEvent}.
   */
  abstract emitMarketplace<T extends keyof IOEmitter.MarketplaceData>(
    data: IOEmitter.MarketplaceEvent<T>,
  ): void;
}

export namespace IOEmitter {
  /* Event interface */

  export interface Event<EventType, EventData = never> {
    type: EventType;
    data?: EventData;
  }

  /* Events */

  export enum Events {
    TICKETS = 'tickets',
    TICKETS_LEAVE = 'tickets_leave',
    OFFERS = 'offers',
    OFFERS_LEAVE = 'offers_leave',
    TRADEABLE_ITEM = 'tradeable_item',
    TRADEABLE_ITEM_LEAVE = 'tradeable_item_leave',
    MARKETPLACE = 'marketplace',
    MARKETPLACE_LEAVE = 'marketplace_leave',
  }

  export type TicketsEvent = Event<TicketEvents, TicketEventsData>;

  export enum TicketEvents {
    CIRCULATION = 'circulation',
  }

  export type TicketEventsData = TicketCirculationWSEventDto;

  /* MARKETPLACE */

  export enum MarketplaceEvents {
    MAKE_TRADEABLE = 'make_tradeable',
    LISTING = 'listing',
    UPDATE = 'update',
    CANCEL = 'cancel',
    BUY = 'buy',
    SELL = 'sell',
  }

  export type MarketplaceData = {
    [MarketplaceEvents.MAKE_TRADEABLE]: MarketplaceMakeTradeableWSEventDto;
    [MarketplaceEvents.LISTING]: MarketplaceListingWSEventDto;
    [MarketplaceEvents.UPDATE]: MarketplaceUpdateWSEventDto;
    [MarketplaceEvents.CANCEL]: MarketplaceCancelWSEventDto;
    [MarketplaceEvents.BUY]: MarketplaceBuyWSEventDto;
    [MarketplaceEvents.SELL]: MarketplaceSellWSEventDto;
  };

  export type MarketplaceEvent<T extends keyof MarketplaceData> = {
    type: T;
    data: MarketplaceData[T];
  };

  /* TRADEABLE_ITEM */

  export type TradeableItemEvent<T extends keyof TradeableItemEventData> = {
    type: T;
    data: TradeableItemEventData[T];
  };

  export type TradeableItemEventData = {
    [TradeableItemEvents.CIRCULATION]: TradeableItemCirculationWSEventDto;
    [TradeableItemEvents.HISTORY]: TradeableItemHistoryWSEventDto;
    [TradeableItemEvents.OFFER]: TradeableItemOfferWSEventDto;
    [TradeableItemEvents.PRICE_LEVELS]: TradeableItemPriceLevelsWSEventDto;
  };

  /**
   * Enum representing various events related to tradeable items in a marketplace.
   */
  export enum TradeableItemEvents {
    /**
     * Updates to the item's trade history.
     */
    HISTORY = 'history',

    /**
     * Indicates the creation of a new offer for an item.
     * This event is specifically for artifacts.
     */
    OFFER = 'offer',

    /**
     * Represents the current circulation status of the item, including:
     * - The number of items currently on sale (`on_sale`).
     * - The total supply of the item (`supply`).
     */
    CIRCULATION = 'circulation',

    /**
     * Represents the pricing tiers of items sold.
     * This event is applicable only to non-artifact items.
     */
    PRICE_LEVELS = 'price_levels',
  }
}
