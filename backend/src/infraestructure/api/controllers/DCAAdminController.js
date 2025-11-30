import { DCAPlanRepository } from "../../../domain/repositories/dcaPlan.repository.ts";
import { DCAExecutionRepository } from "../../../domain/repositories/dcaExecution.repository.ts";
import logger from "../../../config/logger.ts";
const planRepo = new DCAPlanRepository();
const execRepo = new DCAExecutionRepository();
export class DCAAdminController {
    /**
     * 📋 Listar todos los planes (Paginado)
     */
    static async getAllPlans(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const userAddress = req.query.userAddress;
            const filter = {};
            if (status)
                filter.status = status;
            if (userAddress)
                filter.userAddress = userAddress;
            const plans = await planRepo.findAll(page, limit, filter);
            const total = await planRepo.countAll(filter);
            res.status(200).json({
                success: true,
                data: plans,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            logger.error(`❌ Error admin getAllPlans: ${error.message}`);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * 🔍 Ver detalles de un plan específico
     */
    static async getPlanDetails(req, res) {
        try {
            const { planId } = req.params;
            const plan = await planRepo.findById(planId);
            if (!plan) {
                return res.status(404).json({ success: false, message: "Plan not found" });
            }
            // Obtener ejecuciones asociadas
            const executions = await execRepo.findByPlan(planId);
            res.status(200).json({
                success: true,
                data: {
                    ...plan.toObject(),
                    executions
                }
            });
        }
        catch (error) {
            logger.error(`❌ Error admin getPlanDetails: ${error.message}`);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * 📋 Listar todas las ejecuciones (Trazabilidad Global)
     */
    static async getAllExecutions(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const planId = req.query.planId;
            const filter = {};
            if (status)
                filter.status = status;
            if (planId)
                filter.planId = planId;
            const executions = await execRepo.findAll(page, limit, filter);
            const total = await execRepo.countAll(filter);
            res.status(200).json({
                success: true,
                data: executions,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            logger.error(`❌ Error admin getAllExecutions: ${error.message}`);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
