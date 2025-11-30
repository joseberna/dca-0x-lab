import mongoose from "mongoose";
import { DCAPlanRepository } from "../domain/repositories/dcaPlan.repository.ts";
import { connectMongo } from "../infraestructure/database/mongo.connection.ts";
async function createTestPlan() {
    const planRepo = new DCAPlanRepository();
    try {
        await connectMongo();
        const plan = await planRepo.create({
            userAddress: "0x0c1ee65e59cd82c1c6ff3bc0d5e612190f45264d",
            network: "sepolia",
            tokenFrom: "USDC",
            tokenTo: "WETH",
            totalAmount: 100,
            amountPerInterval: 25,
            intervalSeconds: 10, // cada 10 segundos
            totalOperations: 4,
            executedOperations: 0,
            lastExecution: new Date(Date.now() - 20000), // fuerza ejecución inmediata
            nextExecution: new Date(Date.now() + 10000),
            isActive: true,
            status: "active",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log("✅ Test plan created successfully:");
        console.table({
            id: plan._id,
            network: plan.network,
            tokenFrom: plan.tokenFrom,
            tokenTo: plan.tokenTo,
            amountPerInterval: plan.amountPerInterval,
            totalOperations: plan.totalOperations,
        });
    }
    catch (error) {
        console.error("❌ Error creating test plan:", error.message);
    }
    finally {
        mongoose.connection.close();
    }
}
createTestPlan();
