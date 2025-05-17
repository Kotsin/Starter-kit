import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Server, ServerOptions } from 'socket.io';
import { createClient } from 'redis';
import { INestApplication } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  readonly #options: Partial<ServerOptions>;

  #adapterConstructor!: ReturnType<typeof createAdapter>;

  constructor(application: INestApplication, options: Partial<ServerOptions>) {
    super(application);

    this.#options = options;
  }

  async connectToRedis(redisUrl: string | undefined): Promise<void> {
    const pubClient = createClient({
      url: redisUrl,
    });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.#adapterConstructor = createAdapter(pubClient, subClient);
  }

  override createIOServer(port: number) {
    const server = super.createIOServer(port, this.#options) as Server;
    server.adapter(this.#adapterConstructor);
    return server;
  }
}
