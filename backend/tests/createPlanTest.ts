import { connectMongo } from "../src/infraestructure/database/mongo.connection.ts";
import { DCAPlanRepository } from "../src/domain/repositories/dcaPlan.repository.ts";
import mongoose from "mongoose";

(async () => {
  const repo = new DCAPlanRepository();

  try {
    await connectMongo();

    console.log("✅ Connected to MongoDB, creating DCA plan...");

    const plan = await repo.create({
      userAddress: "0x8b2733ea0aad06cb02307b1aa0c88385dd037bb0",
      tokenFrom: "USDC",
      tokenTo: "WBTC",
      amountPerInterval: 25,
      intervalDays: 7,
      totalOperations: 4,
    });

    console.log("🆕 Created DCA Plan:", plan);

    const activePlans = await repo.findActivePlans();
    console.log("📊 Active Plans:", activePlans.length);

    await mongoose.disconnect();
    console.log("🧹 Disconnected cleanly");
  } catch (err: any) {
    console.error("❌ Error in createPlanTest:", err.message);
  }
})();
