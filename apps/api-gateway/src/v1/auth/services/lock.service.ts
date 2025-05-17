import { Injectable } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { RedisStore } from 'cache-manager-redis-yet';
import { TooManyAttemptsException } from '../exceptions/auth.exceptions';

@Injectable()
export class LockService {
  private readonly LOCK_PREFIX = 'lock:';

  constructor(private readonly cacheManager: Cache) {}

  /**
   * Acquire a lock with a given key and TTL
   * @param key - Lock key
   * @param ttl - Time to live in seconds
   * @returns Promise<boolean> - Whether the lock was acquired
   */
  async acquireLock(key: string, ttl = 10): Promise<boolean> {
    const redisClient = (this.cacheManager.store as RedisStore).client;
    const lockKey = `${this.LOCK_PREFIX}${key}`;

    const result = await redisClient.set(lockKey, 'locked', {
      NX: true,
      EX: ttl,
    });

    return result === 'OK';
  }

  /**
   * Release a lock with a given key
   * @param key - Lock key
   */
  async releaseLock(key: string): Promise<void> {
    const redisClient = (this.cacheManager.store as RedisStore).client;
    const lockKey = `${this.LOCK_PREFIX}${key}`;

    await redisClient.del(lockKey);
  }

  /**
   * Try to acquire a lock or throw an exception
   * @param key - Lock key
   * @param ttl - Time to live in seconds
   * @throws TooManyAttemptsException
   */
  async acquireLockOrFail(key: string, ttl = 10): Promise<void> {
    const acquired = await this.acquireLock(key, ttl);

    if (!acquired) {
      throw new TooManyAttemptsException();
    }
  }
} 