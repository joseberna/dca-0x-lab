import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
import { DCAExecutionRepository } from "../../domain/repositories/dcaExecution.repository.ts";
import { OneInchApi } from "../../infraestructure/integrations/oneInchApi.ts";
import { sendTransaction } from "../../infraestructure/blockchain/transactionSender.ts";
import { io } from "../../infraestructure/sockets/socketServer.ts";
import logger from "../../config/logger.ts";

/**
 * 💸 DCAService
 * Servicio principal encargado de ejecutar los planes DCA activos,
 * conectarse a 1inch, firmar transacciones y registrar trazabilidad en Mongo.
 */
export class DCAService {
  private planRepo: DCAPlanRepository;
  private execRepo: DCAExecutionRepository;
  private oneInch: OneInchApi;

  constructor() {
    this.planRepo = new DCAPlanRepository();
    this.execRepo = new DCAExecutionRepository();
    this.oneInch = new OneInchApi();
  }

  /**
   * Ejecuta todos los planes DCA activos.
   * Si NODE_ENV !== "production", se fuerza la ejecución para testing local.
   */
  async executePlans(): Promise<void> {
    const plans = await this.planRepo.findActivePlans();

    // ✅ Validar si no hay planes
    if (!plans.length) {
      logger.info("⚠️ No hay planes DCA activos para procesar.");
      return;
    }

    logger.info(`📈 Checking ${plans.length} active plans...`);

    for (const plan of plans) {
      try {
        const now = new Date();
        const lastExecutionRaw = plan.updatedAt || plan.createdAt;
        const lastExecution = lastExecutionRaw ? new Date(lastExecutionRaw) : now;
        const nextExecution = new Date(
          lastExecution.getTime() + plan.intervalDays * 24 * 60 * 60 * 1000
        );

        // ✅ Control de ejecución
        const forceExecution = process.env.NODE_ENV !== "production";
        const canExecute =
          (forceExecution || now >= nextExecution) &&
          (plan.executedOperations ?? 0) < plan.totalOperations;

        console.log("canExecute", canExecute);

        if (!canExecute) continue;

        logger.info(
          `🚀💸🤑 Ejecutando DCA → Wallet: ${plan.userAddress} | ${plan.tokenFrom} → ${plan.tokenTo}`
        );

        // 🧮 Configuración del swap
        const amountWei = (plan.amountPerInterval * 1e6).toString(); // 6 decimales (USDC)
        const fromToken = process.env.SC_USDC_POLYGON!;
        const toToken = process.env.MOCK_WBTC_ADDRESS!;
        const wallet = plan.userAddress;

        // 📝 Registrar ejecución inicial
        const execution = await this.execRepo.logExecution({
          planId: plan._id!,
          userAddress: wallet,
          tokenFrom: plan.tokenFrom,
          tokenTo: plan.tokenTo,
          amount: plan.amountPerInterval,
          status: "pending",
        });

        // 🚨 Validar que el registro se haya creado correctamente
        if (!execution || !execution._id) {
          throw new Error("⚠️ [DCA] Error creando log de ejecución (sin _id)");
        }

        // 🌐 Obtener data de swap desde 1inch API
        const swapData = await this.oneInch.buildSwap(fromToken, toToken, amountWei, wallet);

        // ⛓️ Enviar transacción real a la blockchain
        const txHash = await sendTransaction(swapData.tx);
        logger.info(`✅ Swap confirmado en blockchain → TxHash: ${txHash}`);

        // 🔁 Actualizar plan (incrementar operación ejecutada)
        await this.planRepo.incrementExecution(plan._id!);

        // 🧾 Actualizar ejecución a "success"
        await this.execRepo.updateExecutionStatus(execution._id.toString(), {
          txHash,
          status: "success",
        });

        // 📡 Emitir evento vía socket
        io.emit("dca:executed", {
          user: plan.userAddress,
          from: plan.tokenFrom,
          to: plan.tokenTo,
          amount: plan.amountPerInterval,
          txHash,
          timestamp: now,
        });

        logger.info(`💰 DCA ejecutado exitosamente para ${plan.userAddress}`);
      } catch (err: any) {
        // ❌ Captura robusta de error
        logger.error(`❌ Error executing DCA: ${err.message}`);

        try {
          await this.execRepo.logExecution({
            planId: plan._id!,
            userAddress: plan.userAddress,
            tokenFrom: plan.tokenFrom,
            tokenTo: plan.tokenTo,
            amount: plan.amountPerInterval,
            status: "failed",
            errorMessage: err.message,
          });
        } catch (subErr: any) {
          logger.error(`⚠️ Error registrando fallo en Mongo: ${subErr.message}`);
        }
      }
    }
  }

}
