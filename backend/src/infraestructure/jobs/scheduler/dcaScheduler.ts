import { Queue } from "bullmq";
import { DCAPlanRepository } from "../../../domain/repositories/dcaPlan.repository.ts";
import { redisConnection } from "../../../config/redis.ts";

const SCHEDULER_INTERVAL = parseInt(process.env.SCHEDULER_INTERVAL || "60000", 10); // 1 min

export const dcaQueue = new Queue("dca-executions", { connection: redisConnection });
const planRepository = new DCAPlanRepository();

export const startDCAScheduler = async (): Promise<void> => {
  console.log(`🕒 DCA Scheduler initialized — running every ${SCHEDULER_INTERVAL / 1000}s`);

  setInterval(async () => {
    try {
      const activePlans = await planRepository.findActivePlans();

      if (!activePlans.length) return;

      for (const plan of activePlans) {
        // ⚙️ Asegurar que lastExecution tenga un valor válido
        const lastExecution = plan.lastExecution ? new Date(plan.lastExecution) : new Date(0);
        const nextExecution = new Date(lastExecution.getTime() + plan.intervalSeconds * 1000);

        // 🧩 Ejecutar solo si el tiempo actual >= nextExecution
        if (new Date() >= nextExecution) {
          await dcaQueue.add("execute-plan", { planId: plan._id.toString() });
          console.log(`📤 Queued DCA plan ${plan._id} for execution`);

          await planRepository.updateNextExecution(plan._id.toString(), {
            executedOperations: plan.executedOperations + 1,
          });

        }
      }
    } catch (error: any) {
      console.error("❌ Error in DCA Scheduler:", error.message);
    }
  }, SCHEDULER_INTERVAL);
};
