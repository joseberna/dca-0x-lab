import dotenv from "dotenv";
import logger from "./config/logger.ts";
import { connectMongo } from "./infraestructure/database/mongo.connection.ts";
import { startServer } from "./infraestructure/api/server.ts";
import { DCAInitService } from "./application/services/DCAInitService.ts";

dotenv.config();

(async () => {
  try {
    logger.info("🔄 Connecting to MongoDB...");
    await connectMongo();
    logger.info("✅ MongoDB connected successfully");

    // 🚀 Iniciar servidor Express + Socket + Cron
    await startServer();

    // 🧩 Crear plan inicial DCA desde .env
    const initService = new DCAInitService();
    await initService.initDefaultPlan();

    logger.info("🌱 DCA default plan initialized successfully");
  } catch (err: any) {
    logger.error(`❌ Error during startup: ${err.message}`);
    process.exit(1);
  }
})();
