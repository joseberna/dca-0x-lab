import { ethers } from "ethers";
import dotenv from "dotenv";
import logger from "../../config/logger.ts";

import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
import { DCAExecutionRepository } from "../../domain/repositories/dcaExecution.repository.ts";

dotenv.config();

// ABI mínimo para DCAAccountingV2
const DCA_ACCOUNTING_ABI = [
  "function executeTick(uint256 planId) external",
  "function createPlan(string toToken, uint256 totalBudget, uint256 amountPerTick, uint256 interval, uint256 totalTicks) external returns (uint256)",
  "function plans(uint256 planId) external view returns (address user, string fromToken, string toToken, uint256 totalBudget, uint256 amountPerTick, uint256 totalTicks, uint256 executedTicks, uint256 interval, uint256 lastExecution, bool active)",
  "event PlanCreated(uint256 indexed planId, address indexed user, string toToken, uint256 totalBudget)"
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
      // Use new V2 address variable
      accountingAddress = process.env.SEPOLIA_ACCOUNTING || process.env.SM_ACCOUNTING_SEPOLIA!;
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

    logger.info(`🔥 DCAService inicializado en red: ${activeNetwork}`, { service: 'DCAService' });
    logger.info(`📍 Contrato Accounting: ${accountingAddress}`, { service: 'DCAService' });
  }

  // ===========================================================
  // CREACIÓN DE PLAN ON-CHAIN
  // ===========================================================

  async createPlanOnChain(params: {
    userAddress: string;
    toToken: string;  // NEW: "WETH", "WBTC", etc.
    totalAmount: number;
    amountPerInterval: number;
    intervalSeconds: number;
    totalOperations: number;
  }) {
    const { userAddress, toToken, intervalSeconds, totalOperations } = params;
    let { totalAmount, amountPerInterval } = params;

    // FIX: Convert human-readable units to atomic units if needed
    // Heuristic: If amount < 1,000,000 (1 USDC), assume it's human readable (e.g. 20) and multiply by 10^6
    if (totalAmount < 1000000) {
      logger.info(`🔄 Converting totalAmount ${totalAmount} to atomic units (x10^6)`, { service: 'DCAService' });
      totalAmount = Math.floor(totalAmount * 1000000);
    }

    if (amountPerInterval < 1000000) {
      logger.info(`🔄 Converting amountPerInterval ${amountPerInterval} to atomic units (x10^6)`, { service: 'DCAService' });
      amountPerInterval = Math.floor(amountPerInterval * 1000000);
    }

    logger.info(`📝 Creating plan on-chain for user ${userAddress}...`, { service: 'DCAService' });
    logger.info(`    Token: ${toToken}`, { service: 'DCAService' });
    logger.info(`    Total: ${totalAmount / 1e6} USDC, Per Tick: ${amountPerInterval / 1e6} USDC`, { service: 'DCAService' });

    // 1. Approve USDC
    const network = process.env.ACTIVE_NETWORK || "sepolia";
    let usdcAddress: string;

    if (network === "sepolia") {
      // Use the new Multi-Token variable if available, fallback to old
      usdcAddress = process.env.SEPOLIA_USDC_TOKEN || process.env.SM_USDC_SEPOLIA!;
    } else {
      usdcAddress = process.env.USDC_POLYGON!;
    }

    if (!usdcAddress) {
      throw new Error(`USDC address not configured for network: ${network}`);
    }

    const usdcContract = new ethers.Contract(usdcAddress, ERC20_ABI, this.wallet);

    logger.info(`🔐 Approving ${totalAmount / 1e6} USDC to DCAAccounting...`, { service: 'DCAService' });

    const approveTx = await usdcContract.approve(
      this.accountingContract.address,
      totalAmount.toString()
    );

    logger.info(`⏳ Waiting for approval... Hash: ${approveTx.hash}`, { service: 'DCAService' });
    await approveTx.wait();
    logger.info("✅ USDC approved", { service: 'DCAService' });

    // 2. Create plan on DCAAccountingV2
    logger.info("📝 Creating plan on blockchain...", { service: 'DCAService' });

    const tx = await this.accountingContract.createPlan(
      toToken,  // NEW: Pass token symbol
      totalAmount.toString(),
      amountPerInterval.toString(),
      intervalSeconds,
      totalOperations
    );

    logger.info(`⏳ Waiting for transaction confirmation... Hash: ${tx.hash}`, { service: 'DCAService' });
    const receipt = await tx.wait();

    // 3. Parse event to get planId
    logger.info(`📋 Transaction confirmed. Parsing ${receipt.logs.length} logs...`, { service: 'DCAService' });

    const accountingLogs = receipt.logs.filter(
      (log: any) => log.address.toLowerCase() === this.accountingContract.address.toLowerCase()
    );

    logger.info(`🔍 Found ${accountingLogs.length} logs from DCAAccounting contract`, { service: 'DCAService' });

    let planId: number | null = null;

    for (const log of accountingLogs) {
      try {
        const parsed = this.accountingContract.interface.parseLog(log);
        logger.info(`    Event: ${parsed.name}`, { service: 'DCAService' });

        if (parsed.name === "PlanCreated") {
          planId = parsed.args.planId.toNumber();
          logger.info(`✅ Plan created on-chain with ID: ${planId}`, { service: 'DCAService' });
          break;
        }
      } catch (e) {
        // Skip logs that don't match
      }
    }

    if (planId === null) {
      throw new Error("Could not extract planId from transaction receipt");
    }

    logger.info(`🧩 Nuevo plan DCA creado para ${userAddress}`, { service: 'DCAService' });

    // Save to database
    const dbPlan = await this.planRepo.create({
      userAddress,
      contractId: planId,
      network,
      tokenFrom: "USDC",
      tokenTo: toToken,  // NEW: Save selected token
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

    logger.info(`✅ Plan synced to database with _id: ${dbPlan._id}`, { service: 'DCAService' });

    return {
      contractId: planId,
      dbId: dbPlan._id,
      txHash: tx.hash,
      toToken,  // NEW: Return selected token
      plan: dbPlan
    };
  }

  async syncPlanFromChain(txHash: string): Promise<any> {
    try {
      logger.info(`🔄 Syncing plan from tx: ${txHash}`, { service: 'DCAService' });
      
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) {
        logger.error(`Transaction receipt not found for ${txHash}`, { service: 'DCAService' });
        throw new Error("Transaction receipt not found");
      }

      logger.info(`Receipt found with ${receipt.logs.length} logs`, { service: 'DCAService' });

      const accountingLogs = receipt.logs.filter(
        (log: any) => log.address.toLowerCase() === this.accountingContract.address.toLowerCase()
      );

      logger.info(`Found ${accountingLogs.length} logs from DCA Accounting contract`, { service: 'DCAService' });

      let planId: number | null = null;
      let userAddress: string | null = null;
      let toToken: string | null = null;
      let totalBudget: any = null;

      for (const log of accountingLogs) {
        try {
          const parsed = this.accountingContract.interface.parseLog(log);
          logger.info(`Parsed event: ${parsed.name}`, { service: 'DCAService' });
          
          if (parsed.name === "PlanCreated") {
            planId = parsed.args.planId.toNumber();
            userAddress = parsed.args.user;
            toToken = parsed.args.toToken;
            totalBudget = parsed.args.totalBudget;
            logger.info(`Plan details: ID=${planId}, User=${userAddress}, Token=${toToken}`, { service: 'DCAService' });
            break;
          }
        } catch (e: any) {
          logger.warn(`Failed to parse log: ${e.message}`, { service: 'DCAService' });
        }
      }

      if (planId === null) {
        logger.error("PlanCreated event not found in logs", { service: 'DCAService' });
        throw new Error("PlanCreated event not found in logs");
      }

      // Check if exists
      const existing = await this.planRepo.findByContractId(planId);
      if (existing) {
          logger.info(`⚠️ Plan ${planId} already exists in DB`, { service: 'DCAService' });
          return existing;
      }

      // Fetch full details from contract
      logger.info(`Fetching on-chain details for plan ${planId}`, { service: 'DCAService' });
      const onChainPlan = await this.accountingContract.plans(planId);
      
      // Save to DB
      const dbPlan = await this.planRepo.create({
        userAddress: userAddress!,
        contractId: planId,
        network: process.env.ACTIVE_NETWORK || "sepolia",
        tokenFrom: "USDC",
        tokenTo: toToken!,
        totalAmount: totalBudget.toNumber(),
        amountPerInterval: onChainPlan.amountPerTick.toNumber(),
        intervalSeconds: onChainPlan.interval.toNumber(),
        totalOperations: onChainPlan.totalTicks.toNumber(),
        executedOperations: onChainPlan.executedTicks.toNumber(),
        lastExecution: new Date(),
        nextExecution: new Date(),
        status: "active",
        isActive: true,
      });

      logger.info(`✅ Plan synced: ${dbPlan._id}`, { service: 'DCAService' });
      return dbPlan;
    } catch (error: any) {
      logger.error(`Failed to sync plan: ${error.message}`, { service: 'DCAService' });
      throw error;
    }
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

    logger.info(`🔵 Ejecutando plan DCA → ${planId}`, { service: 'DCAService' });

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
      const usdcSpent = data.amountPerInterval / 1e6;
      // Use correct price per token
      const tokenPrice = data.tokenTo === 'WETH' ? 2000 : 50000; // WETH: $2000, WBTC: $50000
      const tokenReceived = usdcSpent / tokenPrice;
      logger.info(`\n${"=".repeat(80)}`, { service: 'DCAService' });
      logger.info(`✅ TICK COMPLETADO - Plan ${planId}`, { service: 'DCAService' });
      logger.info(`${"=".repeat(80)}`, { service: 'DCAService' });
      logger.info(`👤 Usuario: ${data.userAddress}`, { service: 'DCAService' });
      logger.info(`💵 USDC gastado: ${usdcSpent.toFixed(2)} USDC`, { service: 'DCAService' });
      logger.info(`🪙  Token (${data.tokenTo}) recibido: ~${tokenReceived.toFixed(8)} (estimado)`, { service: 'DCAService' });
      logger.info(`📊 Progreso: ${ops}/${data.totalOperations} ticks`, { service: 'DCAService' });
      logger.info(`🔗 TX Hash: ${txHash}`, { service: 'DCAService' });
      logger.info(`${"=".repeat(80)}\n`, { service: 'DCAService' });

      await this.planRepo.updateNextExecution(planId, {
        executedOperations: ops,
        status: newStatus,
        isActive: newStatus === "active",
      });

      await this.execRepo.updateExecutionStatus(exec._id, {
        txHash,
        status: "success",
      });

      logger.info(`✅ Tick completado → TX: ${txHash}`, { service: 'DCAService' });

    } catch (err: any) {
      // Detectar si el error es porque el plan ya está inactivo/completado
      if (err.message && err.message.includes("Plan inactive")) {
        logger.warn(`⚠️ Plan ${planId} está inactivo on-chain. Verificando estado...`);

        // Verificar el estado real del plan en blockchain
        const onChainPlan = await this.accountingContract.plans(data.contractId);

        if (!onChainPlan.active && onChainPlan.executedTicks.toNumber() >= onChainPlan.totalTicks.toNumber()) {
          // Plan completado on-chain
          logger.info(`✅ Plan ${planId} completado on-chain. Actualizando DB...`, { service: 'DCAService' });
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
    if (!plan || !plan.contractId) {
      throw new Error("Plan no encontrado o sin contractId");
    }

    logger.info(`⛓️ Enviando transacción executeTick(${plan.contractId}) a la blockchain...`, { service: 'DCAService' });

    const tx = await this.accountingContract.executeTick(plan.contractId);

    logger.info(`⏳ Esperando confirmación... Hash: ${tx.hash}`, { service: 'DCAService' });
    await tx.wait(); // Esperar 1 confirmación

    return tx.hash;
  }
}
