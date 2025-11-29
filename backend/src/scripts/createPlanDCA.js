import dotenv from "dotenv";
import mongoose from "mongoose";
import { DCAPlanModel } from "../domain/models/DCAPlanModel.ts";
dotenv.config();
async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");
    const plan = await DCAPlanModel.create({
        userAddress: "0x8B2733Ea0AaD06Cb02307B1aa0c88385dd037BB0",
        network: "sepolia",
        tokenFrom: "USDC",
        tokenTo: "WETH",
        totalAmount: 10,
        amountPerInterval: 2.5,
        intervalSeconds: 60,
        totalOperations: 4,
        executedOperations: 0,
        lastExecution: null,
        nextExecution: new Date(Date.now() + 60000), // ejecuta en 1 minuto
        status: "active",
        isActive: true,
    });
    console.log("🚀 Plan creado:", plan._id);
    await mongoose.disconnect();
}
main().catch(console.error);
