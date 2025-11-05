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

dotenv.config();

export const startServer = async (): Promise<void> => {
  try {
    // 1️⃣ Inicializar Express y HTTP
    const app = express();
    const server = http.createServer(app);

    // 2️⃣ Middleware base
    app.use(cors());
    app.use(express.json());
    app.use("/api/wallets", walletRoutes);
    app.use("/api/dca", dcaRoutes);
    app.get("/ping", (_, res) => res.send("pong 🏓"));

    // 3️⃣ Swagger
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // 4️⃣ Rutas API (REST)
    app.use("/api/dca", dcaRoutes);

    // 5️⃣ Socket.io
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

    // 6️⃣ Cron job — Ejecutar DCA cada 30s
    nodeCron.schedule("*/30 * * * * *", async () => {
      logger.info("⏱ Running scheduled DCA check...");
      const dcaService = new DCAService();
      await dcaService.executePlans();
    });

    // 7️⃣ Iniciar servidor
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
