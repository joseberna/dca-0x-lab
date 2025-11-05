import mongoose, { Schema, Document } from "mongoose";

export interface WalletDocument extends Document {
  address: string;
  createdAt?: Date;
}

const WalletSchema = new Schema<WalletDocument>(
  {
    address: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
);

export const WalletModel = mongoose.model<WalletDocument>("Wallet", WalletSchema);
