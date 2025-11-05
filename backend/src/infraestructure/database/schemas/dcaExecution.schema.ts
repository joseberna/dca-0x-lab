import mongoose, { Schema } from "mongoose";

const DCAExecutionSchema = new Schema(
  {
    planId: { type: Schema.Types.ObjectId, ref: "DCAPlan", required: true },
    userAddress: { type: String, required: true },
    executedAt: { type: Date, default: Date.now },
    amount: { type: String, required: true },
    txHash: { type: String, required: true },
    status: { type: String, enum: ["success", "failed"], default: "success" },
  },
  { timestamps: true }
);

export default mongoose.model("DCAExecution", DCAExecutionSchema);
