import type { RedisOptions } from "ioredis";

export const redisConnection: RedisOptions = {
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};
