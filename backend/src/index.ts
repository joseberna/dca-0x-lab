import dotenv from "dotenv";
import { connectMongo } from "./infraestructure/database/mongo.connection.ts";
import { startServer } from "./infraestructure/api/server.ts";
import IORedis from "ioredis";

// 🔧 Cargar variables de entorno
dotenv.config();

/**
 * ✅ Verificar conexión a Redis antes de iniciar el servidor
 */
async function checkRedisConnection(): Promise<void> {
  const client = new IORedis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null, // requerido por BullMQ
    enableReadyCheck: false,
  });

  try {
    await client.ping();
    console.log("✅ Redis connection successful");
  } catch (error: any) {
    console.error("❌ Redis connection failed:", error.message);
    throw error;
  } finally {
    client.disconnect();
  }
}

/**
 * 🚀 Bootstrap principal de la aplicación
 */
async function bootstrap(): Promise<void> {
  try {
    console.log("🚀 Starting DCA backend...");

    // 1️⃣ Conectar a MongoDB
    await connectMongo();

    // 2️⃣ Verificar conexión con Redis
    await checkRedisConnection();

    // 3️⃣ Iniciar servidor (Express + Sockets + Scheduler + BullMQ)
    await startServer();

    // 4️⃣ Iniciar Bot de Tesorería (Revisión cada 5 minutos)
    const { TreasuryService } = await import("./application/services/TreasuryService.ts");
    const treasuryBot = new TreasuryService();
    
    console.log("🤖 Starting Treasury Bot...");
    // Ejecutar inmediatamente y luego cada 5 minutos
    treasuryBot.checkAndRefill(); 
    setInterval(() => treasuryBot.checkAndRefill(), 5 * 60 * 1000);

  } catch (err: any) {
    console.error("❌ Fatal error initializing backend:", err.message);
    process.exit(1);
  }
}

/**
 * 🧩 Manejo global de errores y excepciones
 */
process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

// 🔥 Lanzar el backend
bootstrap();
