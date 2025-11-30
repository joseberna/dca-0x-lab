import { Queue } from "bullmq";
import { DCAPlanRepository } from "../../../domain/repositories/dcaPlan.repository.ts";
import { redisConnection } from "../../../config/redis.ts";
import logger from "../../../config/logger.ts";
const SCHEDULER_INTERVAL = parseInt(process.env.SCHEDULER_INTERVAL || "60000", 10); // 1 min
export const dcaQueue = new Queue("dca-executions", { connection: redisConnection });
const planRepository = new DCAPlanRepository();
let schedulerStarted = false;
export const startDCAScheduler = async () => {
    // Prevenir múltiples instancias del scheduler
    if (schedulerStarted) {
        return;
    }
    schedulerStarted = true;
    logger.info(`🕒 DCA Scheduler started. Running every ${SCHEDULER_INTERVAL / 1000}s`, { service: 'System', method: 'Scheduler' });
    setInterval(async () => {
        try {
            const activePlans = await planRepository.findActivePlans();
            if (!activePlans.length)
                return;
            for (const plan of activePlans) {
                const now = new Date();
                // Solo ejecutar si ya pasó la hora programada
                if (plan.nextExecution && now >= new Date(plan.nextExecution)) {
                    // Usar jobId único para evitar duplicados en la cola
                    const jobId = `plan-${plan._id}-${Date.now()}`;
                    await dcaQueue.add("execute-plan", { planId: plan._id.toString(), contractId: plan.contractId }, {
                        jobId,
                        removeOnComplete: true,
                        removeOnFail: false
                    });
                    logger.info(`📤 Queued DCA plan ${plan._id} for execution (Job: ${jobId})`, { service: 'System', method: 'Scheduler' });
                }
            }
        }
        catch (error) {
            logger.error(`❌ Error in DCA Scheduler: ${error.message}`, { service: 'System', method: 'Scheduler' });
        }
    }, SCHEDULER_INTERVAL);
};
