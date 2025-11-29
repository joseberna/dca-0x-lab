import mongoose, { Schema } from "mongoose";
const DCAPlanSchema = new Schema({
    userAddress: { type: String, required: true, index: true },
    contractId: { type: Number, index: true }, // ID on-chain
    network: { type: String, default: "polygon" },
    tokenFrom: { type: String, default: "USDC" },
    tokenTo: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    amountPerInterval: { type: Number, required: true },
    intervalSeconds: { type: Number, required: true },
    totalOperations: { type: Number, required: true },
    executedOperations: { type: Number, default: 0 },
    lastExecution: { type: Date, default: null },
    nextExecution: { type: Date, default: null },
    status: {
        type: String,
        enum: ["active", "paused", "completed", "failed"],
        default: "active"
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model("DCAPlan", DCAPlanSchema);
