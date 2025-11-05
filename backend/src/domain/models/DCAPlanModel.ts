import mongoose, { Schema, Document, Types, Model } from "mongoose";
import type { DCAPlan } from "../entities/DCAPlan.ts";

/**
 * 📄 DCAPlanDocument
 * Representa el documento almacenado en MongoDB.
 */
export interface DCAPlanDocument extends Omit<DCAPlan, "_id">, Document {
  _id: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 🧱 Esquema de Mongoose para planes DCA
 */
const DCAPlanSchema = new Schema<DCAPlanDocument>(
  {
    userAddress: { type: String, required: true, index: true },
    tokenFrom: { type: String, required: true },
    tokenTo: { type: String, required: true },
    amountPerInterval: { type: Number, required: true },
    intervalDays: { type: Number, required: true },
    totalOperations: { type: Number, required: true },
    executedOperations: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// 🔍 Índices útiles
DCAPlanSchema.index({ userAddress: 1, status: 1 });
DCAPlanSchema.index({ createdAt: -1 });

/**
 * 🧩 Export del modelo
 */
export const DCAPlanModel: Model<DCAPlanDocument> =
  mongoose.models.DCAPlan ||
  mongoose.model<DCAPlanDocument>("DCAPlan", DCAPlanSchema);
