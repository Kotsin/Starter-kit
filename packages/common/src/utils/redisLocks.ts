import { RedisClientType } from 'redis';

const LOCK_PREFIX = 'lock:';

export async function acquireLock(
  redisClient: RedisClientType,
  key: string,
  ttlSeconds = 10,
): Promise<{ status: boolean; lockCreatedTime: string | null }> {
  const lockKey = `${LOCK_PREFIX}${key}`;

  const result = await redisClient.set(lockKey, new Date().getTime(), {
    NX: true,
    EX: ttlSeconds,
  });
  const lockCreatedTime = await redisClient.get(lockKey);

  return {
    status: result === 'OK',
    lockCreatedTime,
  };
}

export async function releaseLock(
  redisClient: RedisClientType,
  key: string,
): Promise<void> {
  const lockKey = `${LOCK_PREFIX}${key}`;

  await redisClient.del(lockKey);
}
