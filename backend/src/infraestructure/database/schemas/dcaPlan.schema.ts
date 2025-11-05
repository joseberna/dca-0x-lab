import mongoose, { Schema } from "mongoose";

const DCAPlanSchema = new Schema(
  {
    userAddress: { type: String, required: true, index: true },
    tokenAddress: { type: String, required: true },
    amountPerInterval: { type: String, required: true },
    interval: { type: Number, required: true },
    lastExecution: { type: Date, default: null },
    nextExecution: { type: Date, default: null },
    active: { type: Boolean, default: true },
    txHash: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("DCAPlan", DCAPlanSchema);
