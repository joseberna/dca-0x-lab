import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectMongo = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("❌ Missing MONGO_URI in .env");

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log("✅ Connected to MongoDB Atlas Cluster");
};
