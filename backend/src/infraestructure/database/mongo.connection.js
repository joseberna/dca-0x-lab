import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../../config/logger.ts";
dotenv.config();
export const connectMongo = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri)
        throw new Error("❌ Missing MONGO_URI in .env");
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
    });
    logger.info("✅ Connected to MongoDB Atlas Cluster", { service: 'System', method: 'Database' });
};
