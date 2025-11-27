```typescript
import { Router } from "express";
import { DCAService } from "../../../application/services/DCAService.ts";
import { DCAPlanRepository } from "../../../domain/repositories/dcaPlan.repository.ts";
import { DCAExecutionRepository } from "../../../domain/repositories/dcaExecution.repository.ts";
import { io } from "../../sockets/socketServer.ts";
import logger from "../../../config/logger.ts";

const router = Router();
const dcaService = new DCAService();
const planRepo = new DCAPlanRepository();
const execRepo = new DCAExecutionRepository();

/**
 * @openapi
 * /api/dca/create-on-chain:
 *   post:
 *     summary: Crea un plan DCA directamente en blockchain y sincroniza con DB
 *     tags: [DCA]
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
 *                 description: Dirección del usuario
 *               toToken:
 *                 type: string
 *                 enum: [WETH, WBTC, SOL]
 *                 example: "WETH"
 *                 description: Token destino (WETH, WBTC, SOL)
 *               totalAmount:
 *                 type: number
 *                 example: 300000000
 *                 description: Monto total en USDC (6 decimals) - 300000000 = 300 USDC
 *               amountPerInterval:
 *                 type: number
 *                 example: 100000000
 *                 description: USDC por tick (6 decimals) - 100000000 = 100 USDC
 *               intervalSeconds:
 *                 type: number
 *                 example: 120
 *                 description: Intervalo en segundos entre ticks
 *               totalOperations:
 *                 type: number
 *                 example: 3
 *                 description: Número total de operaciones
 *     responses:
 *       201:
 *         description: Plan creado exitosamente on-chain y en DB
 */
router.post("/create-on-chain", async (req, res) => {
  try {
    const { userAddress, toToken, totalAmount, amountPerInterval, intervalSeconds, totalOperations } = req.body;
    
    // Validaciones
    if (!userAddress || !toToken || !totalAmount || !amountPerInterval || !intervalSeconds || !totalOperations) {
      return res.status(400).json({ 
        success: false, 
        message: "Faltan parámetros requeridos" 
      });
    }

    // Crear plan on-chain y obtener contractId
    const result = await dcaService.createPlanOnChain({
      userAddress,
      toToken,  // NEW: Pass selected token
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
 * /api/dca:
 *   post:
 *     summary: Crea un nuevo plan DCA (solo en DB, legacy)
 *     tags: [DCA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userAddress:
 *                 type: string
 *               tokenFrom:
 *                 type: string
 *               tokenTo:
 *                 type: string
 *               amountPerInterval:
 *                 type: number
 *               intervalDays:
 *                 type: number
 *               totalOperations:
 *                 type: number
 *     responses:
 *       201:
 *         description: Plan creado exitosamente
 */
router.post("/", async (req, res) => {
  try {
    // Create DCA plan request received
    const plan = await planRepo.create(req.body);
    io.emit("dca:created", plan);
    res.status(201).json({ success: true, data: plan });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/dca/wallet/{walletAddress}:
 *   get:
 *     summary: Obtiene todos los planes DCA de una wallet
 *     tags: [DCA]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de planes DCA
 */
router.get("/wallet/:walletAddress", async (req, res) => {
  try {
    const plans = await planRepo.findByUser(req.params.walletAddress);
    res.json({ success: true, data: plans });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/dca/{planId}:
 *   get:
 *     summary: Obtiene el detalle de un plan DCA
 *     tags: [DCA]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del plan
 */
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
 * /api/dca/{planId}:
 *   put:
 *     summary: Actualiza un plan DCA
 *     tags: [DCA]
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *     tags: [DCA]
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

/**
 * @openapi
 * /api/dca/{planId}/executions:
 *   get:
 *     summary: Obtiene las transacciones (ejecuciones) de un plan
 *     tags: [DCA]
 */
router.get("/:planId/executions", async (req, res) => {
  try {
    const execs = await execRepo.findByPlan(req.params.planId);
    res.json({ success: true, data: execs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @openapi
 * /api/dca/execute:
 *   post:
 *     summary: Ejecuta todos los planes activos manualmente
 *     tags: [DCA]
 */
router.post("/execute", async (req, res) => {
  try {
    await dcaService.executePlans();
    res.json({ success: true, message: "Ejecución DCA iniciada" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
