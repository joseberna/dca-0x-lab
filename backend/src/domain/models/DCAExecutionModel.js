import mongoose, { Schema } from "mongoose";
/**
 * 🧱 Esquema de Mongoose
 */
const DCAExecutionSchema = new Schema({
    planId: { type: String, required: true, index: true },
    userAddress: { type: String, required: true, index: true },
    txHash: { type: String },
    tokenFrom: { type: String, required: true },
    tokenTo: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
        index: true,
    },
    executedAt: { type: Date, default: Date.now },
    errorMessage: { type: String },
}, {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
/**
 * 🔍 Índices compuestos recomendados
 * Mejora las consultas frecuentes (por plan o usuario)
 */
DCAExecutionSchema.index({ planId: 1, status: 1 });
DCAExecutionSchema.index({ userAddress: 1, executedAt: -1 });
/**
 * 🧩 Export del modelo
 */
export const DCAExecutionModel = mongoose.models.DCAExecution ||
    mongoose.model("DCAExecution", DCAExecutionSchema);
