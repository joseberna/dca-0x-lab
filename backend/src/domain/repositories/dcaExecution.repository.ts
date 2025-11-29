import { DCAExecutionModel } from "../models/DCAExecutionModel.ts";

export class DCAExecutionRepository {
  async logExecution(data: {
    planId: object;
    userAddress: string;
    txHash?: string;
    tokenFrom: string;
    tokenTo: string;
    amount: number;
    status: "pending" | "success" | "failed";
    errorMessage?: string;
  }) {
    const execution = await DCAExecutionModel.create(data);
    return execution.toObject();
  }

  async updateExecutionStatus(id: string, update: { txHash?: string; status?: string; errorMessage?: string }) {
    await DCAExecutionModel.findByIdAndUpdate(id, update);
  }

  async findByPlan(planId: string) {
    return DCAExecutionModel.find({ planId }).lean();
  }


  /**
   * 🔍 Admin: Listar todas las ejecuciones con paginación
   */
  async findAll(page: number = 1, limit: number = 10, filter: any = {}) {
    const skip = (page - 1) * limit;
    return await DCAExecutionModel.find(filter)
      .sort({ executedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  /**
   * 🔢 Admin: Contar total de ejecuciones
   */
  async countAll(filter: any = {}) {
    return await DCAExecutionModel.countDocuments(filter);
  }

  /**
   * 👤 Usuario: Ver historial de ejecuciones de un usuario
   */
  async findByUser(userAddress: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return await DCAExecutionModel.find({ userAddress })
      .sort({ executedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}
