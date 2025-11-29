import { Queue } from "bullmq";
import { redisConnection } from "../../../config/redis.ts";
export const dcaQueue = new Queue("dca-executions", { connection: redisConnection });
