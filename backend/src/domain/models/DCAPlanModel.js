import mongoose, { Schema } from "mongoose";
/**
 * 🧱 Esquema de Mongoose para planes DCA
 */
const DCAPlanSchema = new Schema({
    userAddress: { type: String, required: true },
    contractId: { type: Number, index: true }, // ID on-chain
    network: { type: String, required: true },
    tokenFrom: { type: String, required: true },
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
        default: "active",
    },
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
// 🔍 Índices útiles
DCAPlanSchema.index({ userAddress: 1, status: 1 });
DCAPlanSchema.index({ createdAt: -1 });
/**
 * 🧩 Export del modelo
 */
export const DCAPlanModel = mongoose.models.DCAPlan ||
    mongoose.model("DCAPlan", DCAPlanSchema);
