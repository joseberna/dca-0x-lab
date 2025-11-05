import { connectMongo } from "../src/infrastructure/database/mongo.connection.ts";
import mongoose from "mongoose";

(async () => {
  try {
    await connectMongo();
    console.log("✅ MongoDB connected successfully");

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("📚 Collections:", collections.map(c => c.name));

    await mongoose.disconnect();
    console.log("🧹 Disconnected cleanly");
  } catch (err: any) {
    console.error("❌ Connection test failed:", err.message);
  }
})();
