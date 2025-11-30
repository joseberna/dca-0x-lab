import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { initSocketServer } from "../sockets/socketServer.ts";
import logger from "../../config/logger.ts";
import dcaRoutes from "./routes/dca.routes.ts";
import walletRoutes from "./routes/wallet.routes.ts";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../../config/swagger.ts";
import { startDCAScheduler } from "../jobs/scheduler/dcaScheduler.ts";
import { dcaWorker } from "../jobs/workers/dcaWorker.ts";
import { serverAdapter } from "../jobs/dashboard.ts";
dotenv.config();
export const startServer = async () => {
    try {
        const app = express();
        const server = http.createServer(app);
        const SCHEDULER_INTERVAL = parseInt(process.env.SCHEDULER_INTERVAL || "60000");
        app.use(cors());
        app.use(express.json());
        // Serve static files (CSS, favicon, etc.)
        app.use(express.static('public'));
        app.use("/api/wallets", walletRoutes);
        app.use("/api/dca", dcaRoutes);
        app.get("/ping", (_, res) => res.send("pong 🏓"));
        app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
            customCssUrl: '/swagger-dark.css',
            customSiteTitle: "DedlyFi DCA API",
            customfavIcon: "/favicon.png"
        }));
        app.use("/admin/queues", serverAdapter.getRouter());
        const io = initSocketServer(server);
        io.on("connection", (socket) => {
            logger.info(`🟢 Socket connected: ${socket.id}`, { service: 'System', method: 'Socket' });
            socket.on("subscribeToWallet", (wallet) => {
                socket.join(wallet);
                logger.info(`👤 Wallet subscribed: ${wallet}`, { service: 'System', method: 'Socket' });
            });
            socket.on("disconnect", () => logger.info(`🔴 Socket disconnected: ${socket.id}`, { service: 'System', method: 'Socket' }));
        });
        // ==========================
        // 🔹 DCA Scheduler 
        // ==========================
        // Iniciar el scheduler una sola vez
        await startDCAScheduler();
        // ==========================
        // 🔹 DCA Worker (procesa ejecuciones)
        // ==========================
        dcaWorker.on("completed", (job) => {
            logger.info(`✅ Job ${job.id} completed`, { service: 'System', method: 'Worker' });
        });
        dcaWorker.on("failed", (job, err) => {
            logger.error(`❌ Job ${job?.id} failed: ${err.message}`, { service: 'System', method: 'Worker' });
        });
        const PORT = process.env.PORT || 4000;
        server.listen(PORT, () => {
            logger.info(`🚀 Server running at http://localhost:${PORT}`, { service: 'System', method: 'Server' });
            logger.info(`📘 Swagger docs: http://localhost:${PORT}/docs`, { service: 'System', method: 'Server' });
        });
    }
    catch (err) {
        logger.error(`❌ Error during server startup: ${err.message}`, { service: 'System', method: 'Server' });
        process.exit(1);
    }
};
