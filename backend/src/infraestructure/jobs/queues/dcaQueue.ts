import { Queue } from "bullmq";
import IORedis from "ioredis";
import { redisConnection } from "../../../config/redis.ts";

const connection = new IORedis(process.env.REDIS_URL!);

export const dcaQueue = new Queue("dca-executions", { connection: redisConnection });

