import { DCAPlanRepository } from "../../../domain/repositories/dcaPlan.repository.ts";
import { DCAExecutionRepository } from "../../../domain/repositories/dcaExecution.repository.ts";
import logger from "../../../config/logger.ts";
const planRepo = new DCAPlanRepository();
const execRepo = new DCAExecutionRepository();
export class DCAUserController {
    /**
     * 👤 Obtener mis planes DCA
     */
    static async getMyPlans(req, res) {
        try {
            const { userAddress } = req.params;
            if (!userAddress) {
                return res.status(400).json({ success: false, message: "User address is required" });
            }
            const plans = await planRepo.findByUser(userAddress);
            res.status(200).json({
                success: true,
                data: plans
            });
        }
        catch (error) {
            logger.error(`❌ Error user getMyPlans: ${error.message}`);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * 👤 Obtener detalles de un plan (incluyendo historial)
     */
    static async getMyPlanDetails(req, res) {
        try {
            const { planId, userAddress } = req.params;
            const plan = await planRepo.findById(planId);
            if (!plan) {
                return res.status(404).json({ success: false, message: "Plan not found" });
            }
            // Seguridad básica: verificar que el plan pertenece al usuario
            if (plan.userAddress.toLowerCase() !== userAddress.toLowerCase()) {
                return res.status(403).json({ success: false, message: "Unauthorized access to this plan" });
            }
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
            logger.error(`❌ Error user getMyPlanDetails: ${error.message}`);
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * 👤 Obtener historial global de ejecuciones del usuario
     */
    static async getMyExecutions(req, res) {
        try {
            const { userAddress } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (!userAddress) {
                return res.status(400).json({ success: false, message: "User address is required" });
            }
            const executions = await execRepo.findByUser(userAddress, page, limit);
            // Nota: countAll debería soportar filtro por usuario para paginación correcta
            // Por ahora devolvemos solo la lista paginada
            res.status(200).json({
                success: true,
                data: executions,
                pagination: {
                    page,
                    limit
                }
            });
        }
        catch (error) {
            logger.error(`❌ Error user getMyExecutions: ${error.message}`);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
