import { DCAExecutionModel } from "../models/DCAExecutionModel.ts";
export class DCAExecutionRepository {
    async logExecution(data) {
        const execution = await DCAExecutionModel.create(data);
        return execution.toObject();
    }
    async updateExecutionStatus(id, update) {
        await DCAExecutionModel.findByIdAndUpdate(id, update);
    }
    async findByPlan(planId) {
        return DCAExecutionModel.find({ planId }).lean();
    }
    /**
     * 🔍 Admin: Listar todas las ejecuciones con paginación
     */
    async findAll(page = 1, limit = 10, filter = {}) {
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
    async countAll(filter = {}) {
        return await DCAExecutionModel.countDocuments(filter);
    }
    /**
     * 👤 Usuario: Ver historial de ejecuciones de un usuario
     */
    async findByUser(userAddress, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        return await DCAExecutionModel.find({ userAddress })
            .sort({ executedAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
    }
}
