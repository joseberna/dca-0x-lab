import dotenv from "dotenv";
import  {connectMongo}  from "./infraestructure/database/mongo.connection.ts";
import { startServer } from "./infraestructure/api/server.ts";

// Cargar variables de entorno
dotenv.config();

async function bootstrap() {
  try {
    console.log("🚀 Starting DCA backend...");

    // 1️⃣ Conectar a MongoDB
    await connectMongo();

    // 2️⃣ Iniciar servidor (Express + Sockets + Scheduler)
    await startServer();

  } catch (err: any) {
    console.error("❌ Fatal error initializing backend:", err.message);
    process.exit(1);
  }
}

// Global error handling
process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

// Bootstrap
bootstrap();
