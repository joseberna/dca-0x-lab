import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import nodeCron from "node-cron";
import { initSocketServer } from "../sockets/socketServer.ts";
import logger from "../../config/logger.ts";
import { DCAService } from "../../application/services/DCAService.ts";
import dcaRoutes from "./routes/dca.routes.ts";
import walletRoutes from "./routes/wallet.routes.ts";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../../config/swagger.ts";
import { startDCAScheduler } from "../jobs/scheduler/dcaScheduler.ts";
import { dcaWorker } from "../jobs/workers/dcaWorker.ts";
import { serverAdapter } from "../jobs/dashboard.ts";

dotenv.config();

export const startServer = async (): Promise<void> => {
  try {
    const app = express();
    const server = http.createServer(app);
    const SCHEDULER_INTERVAL = parseInt(process.env.SCHEDULER_INTERVAL || "60000");

    app.use(cors());
    app.use(express.json());
    app.use("/api/wallets", walletRoutes);
    app.use("/api/dca", dcaRoutes);
    app.get("/ping", (_, res) => res.send("pong 🏓"));

    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use("/admin/queues", serverAdapter.getRouter());

    const io = initSocketServer(server);
    io.on("connection", (socket) => {
      logger.info(`🟢 Socket connected: ${socket.id}`);

      socket.on("subscribeToWallet", (wallet: string) => {
        socket.join(wallet);
        logger.info(`👤 Wallet subscribed: ${wallet}`);
      });

      socket.on("disconnect", () =>
        logger.info(`🔴 Socket disconnected: ${socket.id}`)
      );
    });

    // ==========================
    // 🔹 DCA Scheduler 
    // ==========================
    console.log(`🕒 Scheduler running every ${SCHEDULER_INTERVAL / 1000}s`);

    setInterval(async () => {
      try {
        await startDCAScheduler();
      } catch (error: any) {
        console.error("❌ DCA Scheduler error:", error.message);
      }
    }, SCHEDULER_INTERVAL);

    // ==========================
    // 🔹 DCA Worker (procesa ejecuciones)
    // ==========================
    dcaWorker.on("completed", (job) => {
      console.log(`✅ Job ${job.id} completed`);
    });

    dcaWorker.on("failed", (job, err) => {
      console.error(`❌ Job ${job?.id} failed: ${err.message}`);
    });

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      logger.info(`🚀 Server running at http://localhost:${PORT}`);
      logger.info(`📘 Swagger docs: http://localhost:${PORT}/docs`);
    });
  } catch (err: any) {
    logger.error(`❌ Error during server startup: ${err.message}`);
    process.exit(1);
  }
};
