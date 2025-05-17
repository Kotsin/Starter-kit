import { Server, Socket } from 'socket.io';
import { IOEmitter } from '@crypton-nestjs-kit/io-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtSocketGuard } from '../guards/jwt-socket.guard';

@WebSocketGateway()
export class WebsocketGateway {
  readonly #ioEmitter: IOEmitter;

  constructor(ioEmitter: IOEmitter) {
    this.#ioEmitter = ioEmitter;
  }

  @WebSocketServer()
  private readonly server!: Server;

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage(IOEmitter.Events.TICKETS)
  handleTicketsJoin(@ConnectedSocket() socket: Socket) {
    socket.join(this.#ioEmitter.buildTicketsRoom());
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage(IOEmitter.Events.TICKETS_LEAVE)
  handleTicketsLeave(@ConnectedSocket() socket: Socket) {
    socket.leave(this.#ioEmitter.buildTicketsRoom());
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage(IOEmitter.Events.TRADEABLE_ITEM)
  handleTradableItem(
    //  TODO: type
    @MessageBody() body: any,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(this.#ioEmitter.buildTradableItemRoom(body.id));
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage(IOEmitter.Events.TRADEABLE_ITEM_LEAVE)
  handleTradeableItemLeave(
    //  TODO: type
    @MessageBody() body: any,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.leave(this.#ioEmitter.buildTradableItemRoom(body.id));
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage(IOEmitter.Events.MARKETPLACE)
  handleMarketplace(@ConnectedSocket() socket: Socket) {
    socket.join(this.#ioEmitter.buildMarketplaceRoom(socket.user_id));
  }

  @UseGuards(JwtSocketGuard)
  @SubscribeMessage(IOEmitter.Events.MARKETPLACE_LEAVE)
  handleMarketplaceLeave(@ConnectedSocket() socket: Socket) {
    socket.leave(this.#ioEmitter.buildMarketplaceRoom(socket.user_id));
  }

  getConnectionsCount(): number {
    return this.server?.engine?.clientsCount || 0;
  }
}
