import { Router } from "express";
import { DCAService } from "../../../application/services/DCAService.ts";
import { DCAPlanRepository } from "../../../domain/repositories/dcaPlan.repository.ts";
import { DCAExecutionRepository } from "../../../domain/repositories/dcaExecution.repository.ts";
import { io } from "../../sockets/socketServer.ts";
import logger from "../../../config/logger.ts";
import { DCAAdminController } from "../controllers/DCAAdminController.ts";
import { DCAUserController } from "../controllers/DCAUserController.ts";

const router = Router();
const dcaService = new DCAService();
const planRepo = new DCAPlanRepository();
const execRepo = new DCAExecutionRepository();

// ============================================================================
// 👮 ADMIN ROUTES (Trazabilidad Global)
// ============================================================================

/**
 * @openapi
 * /api/dca/admin/plans:
 *   get:
 *     summary: 👮 [Admin] Listar todos los planes DCA (Paginado)
 *     tags: [DCA Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, paused, failed]
 *       - in: query
 *         name: userAddress
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de planes paginada
 */
router.get("/admin/plans", DCAAdminController.getAllPlans);

/**
 * @openapi
 * /api/dca/admin/plans/{planId}:
 *   get:
 *     summary: 👮 [Admin] Ver detalle completo de un plan y sus ejecuciones
 *     tags: [DCA Admin]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del plan con historial
 */
router.get("/admin/plans/:planId", DCAAdminController.getPlanDetails);

/**
 * @openapi
 * /api/dca/admin/executions:
 *   get:
 *     summary: 👮 [Admin] Trazabilidad global de ejecuciones (Ticks)
 *     tags: [DCA Admin]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [success, failed, pending]
 *       - in: query
 *         name: planId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial global de ejecuciones
 */
router.get("/admin/executions", DCAAdminController.getAllExecutions);


// ============================================================================
// 👤 USER ROUTES (Mi Historial)
// ============================================================================

/**
 * @openapi
 * /api/dca/my-plans/{userAddress}:
 *   get:
 *     summary: 👤 [User] Ver mis planes DCA
 *     tags: [DCA User]
 *     parameters:
 *       - in: path
 *         name: userAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mis planes
 */
router.get("/my-plans/:userAddress", DCAUserController.getMyPlans);

/**
 * @openapi
 * /api/dca/my-plans/{userAddress}/{planId}:
 *   get:
 *     summary: 👤 [User] Ver detalle de mi plan
 *     tags: [DCA User]
 *     parameters:
 *       - in: path
 *         name: userAddress
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle de mi plan
 */
router.get("/my-plans/:userAddress/:planId", DCAUserController.getMyPlanDetails);

/**
 * @openapi
 * /api/dca/my-executions/{userAddress}:
 *   get:
 *     summary: 👤 [User] Ver mi historial de ejecuciones (Ticks)
 *     tags: [DCA User]
 *     parameters:
 *       - in: path
 *         name: userAddress
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Mi historial de ejecuciones
 */
router.get("/my-executions/:userAddress", DCAUserController.getMyExecutions);


// ============================================================================
// ⚙️ CORE ROUTES (Creación y Gestión)
// ============================================================================

/**
 * @openapi
 * /api/dca/create-on-chain:
 *   post:
 *     summary: Crea un plan DCA directamente en blockchain y sincroniza con DB
 *     tags: [DCA Core]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userAddress
 *               - toToken
 *               - totalAmount
 *               - amountPerInterval
 *               - intervalSeconds
 *               - totalOperations
 *             properties:
 *               userAddress:
 *                 type: string
 *                 example: "0x0C1ee65e59Cd82C1C6FF3bc0d5E612190F45264D"
 *               toToken:
 *                 type: string
 *                 enum: [WETH, WBTC, SOL]
 *                 example: "WETH"
 *               totalAmount:
 *                 type: number
 *                 example: 300
 *                 description: Monto total en USDC (ej. 300)
 *               amountPerInterval:
 *                 type: number
 *                 example: 100
 *                 description: Monto por tick en USDC (ej. 100)
 *               intervalSeconds:
 *                 type: number
 *                 example: 60
 *               totalOperations:
 *                 type: number
 *                 example: 3
 *     responses:
 *       201:
 *         description: Plan creado exitosamente
 */
router.post("/create-on-chain", async (req, res) => {
  try {
    const { userAddress, toToken, totalAmount, amountPerInterval, intervalSeconds, totalOperations } = req.body;
    
    if (!userAddress || !toToken || !totalAmount || !amountPerInterval || !intervalSeconds || !totalOperations) {
      return res.status(400).json({ success: false, message: "Faltan parámetros requeridos" });
    }

    const result = await dcaService.createPlanOnChain({
      userAddress,
      toToken,
      totalAmount,
      amountPerInterval,
      intervalSeconds,
      totalOperations
    });

    res.status(201).json({ 
      success: true, 
      data: result,
      message: "Plan creado exitosamente on-chain y sincronizado con DB"
    });
  } catch (err: any) {
    logger.error("[API] Error creating plan on-chain:", { error: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/dca/{planId}:
 *   put:
 *     summary: Actualiza un plan DCA (Pausar/Reanudar)
 *     tags: [DCA Core]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, paused]
 *     responses:
 *       200:
 *         description: Plan actualizado
 */
router.put("/:planId", async (req, res) => {
  try {
    const plan = await planRepo.updatePlan(req.params.planId, req.body);
    io.emit("dca:updated", plan);
    res.json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/dca/{planId}:
 *   delete:
 *     summary: Elimina un plan DCA
 *     tags: [DCA Core]
 */
router.delete("/:planId", async (req, res) => {
  try {
    await planRepo.deletePlan(req.params.planId);
    io.emit("dca:deleted", { planId: req.params.planId });
    res.json({ success: true, message: "Plan eliminado" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 🌍 PUBLIC ROUTES
// ============================================================================

/**
 * @openapi
 * /api/dca/plans:
 *   get:
 *     summary: Listar todos los planes (para filtrado en cliente)
 *     tags: [DCA Public]
 *     responses:
 *       200:
 *         description: Lista de planes
 */
router.get("/plans", async (req, res) => {
  try {
    const plans = await planRepo.findAll(1, 1000);
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Legacy routes (mantener por compatibilidad si es necesario)
router.get("/wallet/:walletAddress", async (req, res) => {
  try {
    const plans = await planRepo.findByUser(req.params.walletAddress);
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:planId", async (req, res) => {
  try {
    const plan = await planRepo.findById(req.params.planId);
    if (!plan) return res.status(404).json({ success: false, message: "Plan no encontrado" });
    res.json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/dca/sync:
 *   post:
 *     summary: Sincroniza un plan desde un hash de transacción
 *     tags: [DCA Core]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - txHash
 *             properties:
 *               txHash:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan sincronizado
 */
router.post("/sync", async (req, res) => {
  try {
    const { txHash } = req.body;
    if (!txHash) return res.status(400).json({ success: false, message: "txHash requerido" });

    const plan = await dcaService.syncPlanFromChain(txHash);
    res.json({ success: true, data: plan });
  } catch (err: any) {
    logger.error(`[API] Error syncing plan: ${err.message}`);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
