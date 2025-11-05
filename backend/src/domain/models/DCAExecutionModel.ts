import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * 🧩 Interface del documento DCAExecution
 * Representa una ejecución individual de un plan DCA (transacción en blockchain).
 */
export interface DCAExecutionDocument extends Document {
  planId: string;             // 🔗 Referencia al plan DCA
  userAddress: string;        // 🧍 Dirección del usuario
  txHash?: string;            // 🔀 Hash de la transacción on-chain
  tokenFrom: string;          // 💱 Token origen
  tokenTo: string;            // 💱 Token destino
  amount: number;             // 💰 Monto de la operación
  status: "pending" | "success" | "failed"; // 📊 Estado de ejecución
  executedAt: Date;           // 🕒 Fecha real de ejecución
  errorMessage?: string;      // ⚠️ Error si la tx falló
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 🧱 Esquema de Mongoose
 */
const DCAExecutionSchema = new Schema<DCAExecutionDocument>(
  {
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
  },
  {
    timestamps: true,
    versionKey: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

/**
 * 🔍 Índices compuestos recomendados
 * Mejora las consultas frecuentes (por plan o usuario)
 */
DCAExecutionSchema.index({ planId: 1, status: 1 });
DCAExecutionSchema.index({ userAddress: 1, executedAt: -1 });

/**
 * 🧩 Export del modelo
 */
export const DCAExecutionModel: Model<DCAExecutionDocument> =
  mongoose.models.DCAExecution ||
  mongoose.model<DCAExecutionDocument>("DCAExecution", DCAExecutionSchema);
