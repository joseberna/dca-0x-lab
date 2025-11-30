import mongoose, { Schema } from "mongoose";
const WalletSchema = new Schema({
    address: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });
export const WalletModel = mongoose.model("Wallet", WalletSchema);
