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
}
