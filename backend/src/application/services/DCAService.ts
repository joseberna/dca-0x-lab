import { ethers } from "ethers";
import dotenv from "dotenv";
import logger from "../../config/logger.ts";

import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
import { DCAExecutionRepository } from "../../domain/repositories/dcaExecution.repository.ts";

dotenv.config();

// ABI mínimo para DCAAccounting
const DCA_ACCOUNTING_ABI = [
  "function executeTick(uint256 planId) external",
  "function createPlan(address tokenFrom, address tokenTo, uint256 totalBudget, uint256 amountPerTick, uint256 interval, uint256 totalTicks) external returns (uint256)",
  "function plans(uint256 planId) external view returns (address user, address tokenFrom, address tokenTo, uint256 totalBudget, uint256 amountPerTick, uint256 totalTicks, uint256 executedTicks, uint256 interval, uint256 lastExecution, bool active)",
  "event PlanCreated(uint256 indexed planId, address indexed user, uint256 totalBudget)"
];

// ABI mínimo para ERC20 (approve)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)"
];

export class DCAService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private accountingContract: ethers.Contract;

  private planRepo: DCAPlanRepository;
  private execRepo: DCAExecutionRepository;

  constructor() {
    this.planRepo = new DCAPlanRepository();
    this.execRepo = new DCAExecutionRepository();

    // Configuración de red basada en ACTIVE_NETWORK
    const activeNetwork = process.env.ACTIVE_NETWORK || "sepolia";
    
    let rpcUrl: string;
    let accountingAddress: string;

    if (activeNetwork === "sepolia") {
      rpcUrl = process.env.RPC_URL_SEPOLIA!;
      accountingAddress = process.env.SM_ACCOUNTING_SEPOLIA!;
    } else if (activeNetwork === "polygon") {
      rpcUrl = process.env.RPC_URL_POLYGON!;
      accountingAddress = process.env.DCA_ACCOUNTING_ADDRESS!;
    } else {
      throw new Error(`Invalid ACTIVE_NETWORK: ${activeNetwork}. Use 'sepolia' or 'polygon'`);
    }

    if (!rpcUrl) throw new Error(`RPC URL not configured for network: ${activeNetwork}`);
    if (!accountingAddress) throw new Error(`Accounting address not configured for network: ${activeNetwork}`);

    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE KEY no configurada");

    this.wallet = new ethers.Wallet(privateKey, this.provider);

    this.accountingContract = new ethers.Contract(
      accountingAddress,
      DCA_ACCOUNTING_ABI,
      this.wallet
    );

    logger.info(`🔥 DCAService inicializado en red: ${activeNetwork}`);
    logger.info(`📍 Contrato Accounting: ${accountingAddress}`);
  }

  // ===========================================================
  // CREACIÓN DE PLAN ON-CHAIN
  // ===========================================================

  async createPlanOnChain(params: {
    userAddress: string;
    totalAmount: number;
    amountPerInterval: number;
    intervalSeconds: number;
    totalOperations: number;
  }) {
    const { userAddress, totalAmount, amountPerInterval, intervalSeconds, totalOperations } = params;

    // Obtener direcciones de tokens desde .env basado en ACTIVE_NETWORK
    const network = process.env.ACTIVE_NETWORK || "sepolia";
    
    let usdcAddress: string;
    let wbtcAddress: string;

    if (network === "sepolia") {
      usdcAddress = process.env.SM_USDC_SEPOLIA!;
      wbtcAddress = process.env.SM_WBTC_SEPOLIA!;
    } else if (network === "polygon") {
      usdcAddress = process.env.USDC_POLYGON!;
      wbtcAddress = process.env.WBTC_POLYGON!;
    } else {
      throw new Error(`Invalid ACTIVE_NETWORK: ${network}`);
    }

    if (!usdcAddress || !wbtcAddress) {
      throw new Error(`Token addresses not configured for network: ${network}`);
    }

    // Convertir a unidades con decimales (USDC = 6 decimals)
    const totalBudget = ethers.utils.parseUnits(totalAmount.toString(), 6);
    const amountPerTick = ethers.utils.parseUnits(amountPerInterval.toString(), 6);

    logger.info(`📝 Creating plan on-chain for user ${userAddress}...`);
    logger.info(`   Total: ${totalAmount} USDC, Per Tick: ${amountPerInterval} USDC`);

    // PASO 1: Aprobar USDC al contrato DCAAccounting
    logger.info(`🔐 Approving ${totalAmount} USDC to DCAAccounting...`);
    const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, this.wallet);
    const approveTx = await usdcContract.approve(
      this.accountingContract.address,
      totalBudget
    );
    logger.info(`⏳ Waiting for approval... Hash: ${approveTx.hash}`);
    await approveTx.wait();
    logger.info(`✅ USDC approved`);

    // PASO 2: Crear plan en blockchain
    logger.info(`📝 Creating plan on blockchain...`);
    const tx = await this.accountingContract.createPlan(
      usdcAddress,
      wbtcAddress,
      totalBudget,
      amountPerTick,
      intervalSeconds,
      totalOperations
    );

    logger.info(`⏳ Waiting for transaction confirmation... Hash: ${tx.hash}`);
    const receipt = await tx.wait();

    logger.info(`📋 Transaction confirmed. Parsing ${receipt.logs.length} logs...`);

    // Extraer planId del evento PlanCreated
    // Filtrar solo logs del contrato DCAAccounting
    const accountingLogs = receipt.logs.filter((log: any) => 
      log.address.toLowerCase() === this.accountingContract.address.toLowerCase()
    );

    logger.info(`🔍 Found ${accountingLogs.length} logs from DCAAccounting contract`);

    const event = accountingLogs.find((log: any) => {
      try {
        const parsed = this.accountingContract.interface.parseLog(log);
        logger.info(`   Event: ${parsed?.name}`);
        return parsed?.name === "PlanCreated";
      } catch (e) {
        return false;
      }
    });

    if (!event) {
      logger.error(`❌ PlanCreated event not found. Available events:`);
      accountingLogs.forEach((log: any) => {
        try {
          const parsed = this.accountingContract.interface.parseLog(log);
          logger.error(`   - ${parsed.name}`);
        } catch (e) {
          logger.error(`   - Unable to parse log`);
        }
      });
      throw new Error("PlanCreated event not found in transaction receipt");
    }

    const parsedLog = this.accountingContract.interface.parseLog(event);
    const contractId = parsedLog.args.planId.toNumber();

    logger.info(`✅ Plan created on-chain with ID: ${contractId}`);

    // Guardar en base de datos
    const dbPlan = await this.planRepo.create({
      userAddress,
      contractId,
      network,
      tokenFrom: "USDC",
      tokenTo: "WBTC",
      totalAmount,
      amountPerInterval,
      intervalSeconds,
      totalOperations,
      executedOperations: 0,
      lastExecution: new Date(),
      nextExecution: new Date(),
      status: "active",
      isActive: true,
    });

    logger.info(`✅ Plan synced to database with _id: ${dbPlan._id}`);

    return {
      contractId,
      dbId: dbPlan._id,
      txHash: tx.hash,
      plan: dbPlan
    };
  }

  // ===========================================================
  // EJECUCIÓN DEL PLAN DCA
  // ===========================================================

  async executePlan(planId: string): Promise<void> {
    const plan = await this.planRepo.findById(planId);
    if (!plan) throw new Error(`Plan ${planId} no encontrado`);

    const data = plan.toJSON ? plan.toJSON() : plan;

    // Validación local antes de intentar on-chain
    if (data.executedOperations >= data.totalOperations) {
      return this.planRepo.updateNextExecution(planId, {
        status: "completed",
        isActive: false,
      });
    }

    logger.info(`🔵 Ejecutando plan DCA → ${planId}`);

    // Log de intento de ejecución
    const exec = await this.execRepo.logExecution({
      planId,
      userAddress: data.userAddress,
      tokenFrom: "USDC",
      tokenTo: data.tokenTo,
      amount: data.amountPerInterval,
      status: "pending",
    });

    try {
      // FIX: Si el plan no tiene contractPlanId, no podemos ejecutarlo on-chain.
      if (!data.contractId) {
        logger.warn(`⚠️ Plan ${planId} es legacy (sin contractId). Pausando automáticamente.`);
        await this.planRepo.updateNextExecution(planId, {
          status: "paused",
          isActive: false
        });
        return;
      }

      // Llamada al contrato inteligente
      const txHash = await this.executeTickOnChain(planId);

      const ops = data.executedOperations + 1;
      const newStatus = ops >= data.totalOperations ? "completed" : "active";

      // 📊 LOGS DETALLADOS DEL TICK
      logger.info(`\n${"=".repeat(80)}`);
      logger.info(`✅ TICK COMPLETADO - Plan ${planId}`);
      logger.info(`${"=".repeat(80)}`);
      logger.info(`👤 Usuario: ${data.userAddress}`);
      logger.info(`💵 USDC gastado: ${data.amountPerInterval} USDC`);
      logger.info(`🪙  WBTC recibido: ~${(data.amountPerInterval / 50000).toFixed(8)} WBTC (estimado)`);
      logger.info(`📊 Progreso: ${ops}/${data.totalOperations} ticks`);
      logger.info(`🔗 TX Hash: ${txHash}`);
      logger.info(`${"=".repeat(80)}\n`);

      await this.planRepo.updateNextExecution(planId, {
        executedOperations: ops,
        status: newStatus,
        isActive: newStatus === "active",
      });

      await this.execRepo.updateExecutionStatus(exec._id, {
        txHash,
        status: "success",
      });

      logger.info(`✅ Tick completado → TX: ${txHash}`);

    } catch (err: any) {
      // Detectar si el error es porque el plan ya está inactivo/completado
      if (err.message && err.message.includes("Plan inactive")) {
        logger.warn(`⚠️ Plan ${planId} está inactivo on-chain. Verificando estado...`);
        
        // Verificar el estado real del plan en blockchain
        const onChainPlan = await this.accountingContract.plans(data.contractId);
        
        if (!onChainPlan.active && onChainPlan.executedTicks.toNumber() >= onChainPlan.totalTicks.toNumber()) {
          // Plan completado on-chain
          logger.info(`✅ Plan ${planId} completado on-chain. Actualizando DB...`);
          await this.planRepo.updateNextExecution(planId, {
            executedOperations: onChainPlan.totalTicks.toNumber(),
            status: "completed",
            isActive: false,
          });
          
          await this.execRepo.updateExecutionStatus(exec._id, {
            status: "failed",
            errorMessage: "Plan already completed on-chain",
          });
          return;
        } else {
          // Plan pausado/cancelado por otra razón
          logger.warn(`⚠️ Plan ${planId} inactivo pero no completado. Pausando...`);
          await this.planRepo.updateNextExecution(planId, {
            status: "paused",
            isActive: false,
          });
        }
      }

      await this.execRepo.updateExecutionStatus(exec._id, {
        status: "failed",
        errorMessage: err.message,
      });

      logger.error(`❌ Error ejecutando plan ${planId}: ${err.message}`);
    }
  }

  // ===========================================================
  // INTERACCIÓN CON SMART CONTRACT
  // ===========================================================

  private async executeTickOnChain(mongoPlanId: string): Promise<string> {
    // Recuperar el plan para obtener su ID numérico on-chain
    const plan = await this.planRepo.findById(mongoPlanId);
    // logger.info(`Plan encontrado: ${JSON.stringify(plan)}`);
    if (!plan || !plan.contractId) {
      throw new Error("Plan no encontrado o sin contractId");
    }

    logger.info(`⛓️ Enviando transacción executeTick(${plan.contractId}) a la blockchain...`);

    // Estimación de gas opcional pero recomendada
    // const gasLimit = await this.accountingContract.estimateGas.executeTick(plan.contractId);

    const tx = await this.accountingContract.executeTick(plan.contractId);

    logger.info(`⏳ Esperando confirmación... Hash: ${tx.hash}`);
    await tx.wait(); // Esperar 1 confirmación

    return tx.hash;
  }
}
