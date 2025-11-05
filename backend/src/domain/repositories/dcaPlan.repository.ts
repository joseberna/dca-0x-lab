import { DCAPlanModel } from "../models/DCAPlanModel.ts";
import logger from "../../config/logger.ts";

export class DCAPlanRepository {
  /**
   * 🆕 Crea un nuevo plan DCA
   */
  async create(planData: any) {
    try {
      console.log("[DCAPlanRepository] Creating plan with data:", planData);
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
      return await DCAPlanModel.findById(id).lean();
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
}
