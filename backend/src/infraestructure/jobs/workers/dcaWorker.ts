import { Worker } from "bullmq";
import IORedis from "ioredis";
import { DCAService } from "../../../application/services/DCAService.ts";
import { redisConnection } from "../../../config/redis.ts";

const connection = new IORedis(process.env.REDIS_URL!);
const dcaService = new DCAService();

export const dcaWorker = new Worker(
  "dca-executions",
  async (job) => {
    const { planId } = job.data;
    console.log(`🚀 Executing DCA plan ${planId}...`);

    await dcaService.executePlan(planId);

    console.log(`✅ DCA plan ${planId} executed successfully`);
  },
  {
    connection: {
      ...redisConnection,          // si ya exportas un objeto base con host/port
      maxRetriesPerRequest: null,  // 👈 Obligatorio para BullMQ
      enableReadyCheck: false,     // 👈 Evita bloqueos en modo cluster
    },
  }
);

dcaWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed: ${err.message}`);
});
