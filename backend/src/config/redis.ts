import IORedis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
