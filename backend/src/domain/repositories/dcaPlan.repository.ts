import { DCAPlanModel } from "../models/DCAPlanModel.ts";
import logger from "../../config/logger.ts";

export class DCAPlanRepository {
  /**
   * 🆕 Crea un nuevo plan DCA
   */
  async create(planData: any) {
    try {
      const newPlan = await DCAPlanModel.create(planData);
      logger.info(`🧩 Nuevo plan DCA creado para ${planData.userAddress}`);
      return newPlan.toObject();
    } catch (err: any) {
      logger.error(`❌ Error creando plan DCA: ${err.message}`);
      throw err;
    }
  }

  /**
   * 🔍 Busca todos los planes asociados a una wallet
   */
  async findByUser(userAddress: string) {
    try {
      return await DCAPlanModel.find({ userAddress }).lean();
    } catch (err: any) {
      logger.error(`❌ Error buscando planes de usuario ${userAddress}: ${err.message}`);
      throw err;
    }
  }

  /**
   * 🔍 Busca un plan por su ID
   */
  async findById(id: string) {
    try {
      return await DCAPlanModel.findById(id);
    } catch (err: any) {
      logger.error(`❌ Error buscando plan DCA ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * 🔍 Busca planes activos
   */
  async findActivePlans() {
    try {
      return await DCAPlanModel.find({ status: "active" }).lean();
    } catch (err: any) {
      logger.error(`❌ Error listando planes activos: ${err.message}`);
      throw err;
    }
  }

  /**
   * ✏️ Actualiza un plan existente
   */
  async updatePlan(id: string, updates: any) {
    try {
      const plan = await DCAPlanModel.findByIdAndUpdate(id, updates, { new: true }).lean();
      if (!plan) throw new Error("Plan no encontrado");
      return plan;
    } catch (err: any) {
      logger.error(`❌ Error actualizando plan ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * 🗑️ Elimina un plan
   */
  async deletePlan(id: string) {
    try {
      await DCAPlanModel.findByIdAndDelete(id);
      logger.info(`🗑️ Plan DCA eliminado (${id})`);
      return true;
    } catch (err: any) {
      logger.error(`❌ Error eliminando plan ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * 🔁 Incrementa el número de ejecuciones realizadas
   */
  async incrementExecution(id: string) {
    try {
      await DCAPlanModel.findByIdAndUpdate(id, { $inc: { executedOperations: 1 } });
    } catch (err: any) {
      logger.error(`❌ Error incrementando ejecución para plan ${id}: ${err.message}`);
      throw err;
    }
  }

  async updateStatus(planId: string, status: string) {
    return await DCAPlanModel.findByIdAndUpdate(planId, { status }, { new: true });
  }
  async markAsCompleted(planId: string) {
    return await DCAPlanModel.findByIdAndUpdate(
      planId,
      {
        status: "completed",
        isActive: false,
        updatedAt: new Date(),
      },
      { new: true }
    );
  }

  async updateNextExecution(
    planId: string,
    data: {
      executedOperations?: number;
      status?: string;
      isActive?: boolean;
    }
  ) {
    const plan = await DCAPlanModel.findById(planId);
    if (!plan) throw new Error(`Plan not found: ${planId}`);

    const now = new Date();

    // Si se proporciona executedOperations, actualizar lógica de siguiente ejecución
    if (data.executedOperations !== undefined) {
      const newExecutedOps = data.executedOperations;

      // Calcular próxima ejecución
      const nextExecution: any =
        newExecutedOps < plan.totalOperations
          ? new Date(now.getTime() + plan.intervalSeconds * 1000)
          : null;

      const isCompleted = newExecutedOps >= plan.totalOperations;

      plan.executedOperations = newExecutedOps;
      plan.lastExecution = now;
      plan.nextExecution = nextExecution;
      plan.status = isCompleted ? "completed" : "active";
      plan.isActive = !isCompleted;
    }

    // Permitir override manual de status e isActive
    if (data.status !== undefined) {
      plan.status = data.status as any;
    }
    if (data.isActive !== undefined) {
      plan.isActive = data.isActive;
    }

    plan.updatedAt = now;

    logger.info(
      `[DCAPlanRepository] Updated execution for ${planId}: ${plan.executedOperations}/${plan.totalOperations}`,
      { service: 'System', method: 'Repository' }
    );

    return await plan.save();
  }


  /**
   * 🔍 Admin: Listar todos los planes con paginación
   */
  async findAll(page: number = 1, limit: number = 10, filter: any = {}) {
    try {
      const skip = (page - 1) * limit;
      return await DCAPlanModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    } catch (err: any) {
      logger.error(`❌ Error listando todos los planes: ${err.message}`);
      throw err;
    }
  }

  /**
   * 🔢 Admin: Contar total de planes (para paginación)
   */
  async countAll(filter: any = {}) {
    return await DCAPlanModel.countDocuments(filter);
  }
}
