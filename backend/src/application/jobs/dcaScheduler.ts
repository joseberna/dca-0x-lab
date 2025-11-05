import { dcaEngine } from "../../infraestructure/blockchain/blockchain.provider.js";
import { config } from "../../config/env.js";
import cron from "node-cron";

export const startDcaScheduler = () => {
  console.log("🕒 DCA Scheduler running...");

  cron.schedule("*/1 * * * *", async () => {
    try {
      console.log("⚡ Ejecutando ciclo DCA automático...");
      const tx = await dcaEngine.executePlan(config.DEV_ADDRESS);
      await tx.wait();
      console.log("✅ Plan ejecutado automáticamente:", tx.hash);
    } catch (err) {
      console.error("❌ Error en DCA Scheduler:", err.message);
    }
  });
};
