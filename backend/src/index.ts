import dotenv from "dotenv";
import { connectMongo } from "./infraestructure/database/mongo.connection.ts";
import { startServer } from "./infraestructure/api/server.ts";
import IORedis from "ioredis";
import logger from "./config/logger.ts";

// 🔧 Cargar variables de entorno
dotenv.config();

/**
 * ✅ Verificar conexión a Redis antes de iniciar el servidor
 */
async function checkRedisConnection(): Promise<void> {
  logger.info("Checking Redis connection...", { service: 'System', method: 'Redis' });
  const redisConnection = new IORedis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
  logger.info("Redis redisConnection: " + redisConnection, { service: 'System', method: 'Redis' });

  try {
    await redisConnection.ping();
    logger.info("✅ Redis connection successful", { service: 'System', method: 'Redis' });
  } catch (error: any) {
    logger.error(`❌ Redis connection failed: ${error.message}`, { service: 'System', method: 'Redis' });
    throw error;
  } finally {
    redisConnection.disconnect();
  }
}

/**
 * 🚀 Bootstrap principal de la aplicación
 */
async function bootstrap(): Promise<void> {
  try {
    logger.info("🚀 Starting DCA backend...", { service: 'System', method: 'index' });

    // 1️⃣ Conectar a MongoDB
    await connectMongo();

    // 2️⃣ Verificar conexión con Redis
    await checkRedisConnection();

    // 3️⃣ Iniciar servidor (Express + Sockets + Scheduler + BullMQ)
    await startServer();

    // 4️⃣ Iniciar Bot de Tesorería (Revisión cada 5 minutos)
    const { TreasuryService } = await import("./application/services/TreasuryService.ts");
    // ==========================
    // 🤖 Treasury Bots (Multi-Token)
    // ==========================
    logger.info("🤖 Starting Treasury Bots...", { service: 'System', method: 'index' });

    // 1. WBTC Treasury
    const wbtcTreasury = new TreasuryService({
      tokenSymbol: "WBTC",
      tokenAddress: process.env.SEPOLIA_WBTC_TOKEN || process.env.SM_WBTC_SEPOLIA!,
      treasuryAddress: process.env.SEPOLIA_WBTC_VAULT || process.env.SM_TREASURYVAULT_SEPOLIA!,
      lowBalanceThreshold: 0.1,
      refillAmount: 1.0
    });

    // 2. WETH Treasury
    const wethTreasury = new TreasuryService({
      tokenSymbol: "WETH",
      tokenAddress: process.env.SEPOLIA_WETH_TOKEN!,
      treasuryAddress: process.env.SEPOLIA_WETH_VAULT!,
      lowBalanceThreshold: 0.5,
      refillAmount: 5.0
    });

    // Start independent loops (threads)
    setInterval(() => wbtcTreasury.checkAndRefill(), 60000); // Check every 60s
    setInterval(() => wethTreasury.checkAndRefill(), 60000); // Check every 60s

    logger.info("✅ Treasury Bots started (WBTC & WETH) on separate threads", { service: 'System', method: 'Treasury' });

  } catch (err: any) {
    logger.error(`❌ Fatal error initializing backend: ${err.message}`, { service: 'System' });
    process.exit(1);
  }
}

/**
 * 🧩 Manejo global de errores y excepciones
 */
process.on("unhandledRejection", (reason) => {
  logger.error(`⚠️ Unhandled Promise Rejection: ${reason}`, { service: 'System' });
});

process.on("uncaughtException", (err) => {
  logger.error(`💥 Uncaught Exception: ${err}`, { service: 'System' });
  process.exit(1);
});

// 🔥 Lanzar el backend
bootstrap();
