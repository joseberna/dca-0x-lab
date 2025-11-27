import { Worker } from "bullmq";
import IORedis from "ioredis";
import { DCAPlanRepository } from "../../../domain/repositories/dcaPlan.repository.ts";
import { DCAService } from "../../../application/services/DCAService.ts";
import { redisConnection } from "../../../config/redis.ts";
import logger from "../../../config/logger.ts";

const connection = new IORedis(process.env.REDIS_URL!);
const dcaService = new DCAService();
const planRepository = new DCAPlanRepository();


export const dcaWorker = new Worker(
  "dca-executions",
  async (job) => {
    const { planId, contractId } = job.data;
    try {
      logger.info(`🚀 Executing DCA planID ${planId}...`, { service: 'System', method: 'Worker' });
      logger.info(`🚀 Executing DCA contractId ${contractId}...`, { service: 'System', method: 'Worker' });

      // 1️⃣ Ejecutar el plan (swap on-chain o mock)
      await dcaService.executePlan(planId);

      // 2️⃣ Obtener plan actualizado
      const plan = await planRepository.findById(planId);
      if (!plan) throw new Error(`Plan not found: ${planId}`);

      // 3️⃣ Re-activar si aún no ha completado todas las operaciones
      if (plan.executedOperations < plan.totalOperations) {
        const nextExecution = new Date(
          Date.now() + plan.intervalSeconds * 1000
        );
        await planRepository.updatePlan(planId, {
          isActive: true,
          nextExecution,
        });

        logger.info(
          `[INFO] Plan ${planId} programado nuevamente para ${nextExecution.toISOString()}`,
          { service: 'System', method: 'Worker' }
        );
      } else {
        logger.info(`[INFO] ✅ Plan ${planId} completado definitivamente`, { service: 'System', method: 'Worker' });
      }

      return { success: true, planId };
    } catch (error: any) {
      logger.error(`❌ Job ${job.id} failed: ${error.message}`, { service: 'System', method: 'Worker' });
      throw error;
    }
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
  logger.error(`❌ Job ${job?.id} failed: ${err.message}`, { service: 'System', method: 'Worker' });
});
