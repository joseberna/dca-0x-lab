import axios from "axios";
import Web3 from "web3";
import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
import type { DCAPlan } from "../../domain/entities/DCAPlan.ts";

const ONEINCH_API = "https://api.1inch.dev/swap/v5.2";
const SEPOLIA_RPC = "https://sepolia.infura.io/v3/" + process.env.INFURA_API_KEY;

// ⚙️ Cliente Web3 conectado a Sepolia (puedes extender a Polygon, etc.)
const web3 = new Web3(new Web3.providers.HttpProvider(SEPOLIA_RPC));
const dcaPlanRepository = new DCAPlanRepository();

/**
 * Servicio principal de ejecución de planes DCA
 * - Obtiene plan de Mongo
 * - Calcula swapData desde 1inch
 * - Ejecuta transacción en contrato
 * - Actualiza estado del plan
 */
export class DCAService {
  async executePlan(planId: string): Promise<void> {
    try {
      const planDoc = await dcaPlanRepository.findById(planId);
      if (!planDoc) throw new Error(`❌ Plan no encontrado: ${planId}`);

      const plan = typeof planDoc.toObject === "function"
        ? (planDoc.toObject() as DCAPlan)
        : (planDoc as unknown as DCAPlan);

      console.log(`[INFO] Ejecutando plan ${planId} (${plan.tokenFrom} → ${plan.tokenTo})`);

      // 1️⃣ Obtener datos para el swap desde 1inch
      const swapData = await this.buildSwapData(plan);

      // 2️⃣ Ejecutar swap en contrato DCAPlanManager
      await this.executeSwapOnChain(plan, swapData);

      // 3️⃣ Actualizar progreso del plan en la base de datos
      await dcaPlanRepository.updateNextExecution(plan._id as string, {
        executedOperations: plan.executedOperations + 1,
      });

      console.log(`[INFO] ✅ Plan ${planId} ejecutado correctamente`);
    } catch (error: any) {
      console.error(`[ERROR] ❌ Error ejecutando plan ${planId}:`, error.message);
      throw error;
    }
  }

  /**
   * 📦 Genera swapData desde 1inch API
   */
  async buildSwapData(plan: DCAPlan) {
    try {
      const chainIds: Record<string, number> = {
        sepolia: 11155111,
        polygon: 137,
        mainnet: 1,
      };

      const chainId = chainIds[plan.network.toLowerCase()] || 11155111;
      const baseUrl = `https://api.1inch.io/v5.2/${chainId}`;

      const url = `${baseUrl}/swap`;
      const params = {
        fromTokenSymbol: plan.tokenFrom,
        toTokenSymbol: plan.tokenTo,
        amount: plan.amountPerInterval,
      };

      console.log(`[INFO] Consultando swap: ${url}`, params);

      // Evitar request real en testnets
      if (plan.network === "sepolia") {
        console.warn("⚠️ Mocking swap data for Sepolia (no 1inch support)");
        return {
          tx: {
            to: "0xMockSwapRouter",
            data: "0x123456",
            value: "0",
          },
          estimatedGas: "250000",
        };
      }

      const response = await axios.get(url, { params });
      return response.data;
    } catch (err: any) {
      console.error(`[ERROR] ❌ buildSwapData falló: ${err.message}`);
      return null;
    }
  }


  /**
   * ⚡ Ejecuta el swap en contrato inteligente (placeholder)
   */
  async executeSwapOnChain(plan: DCAPlan, swapData: any) {
    try {
      console.log(`[TX] 🚀 Ejecutando swap on-chain...`);

      // En producción, aquí llamas al método del contrato `executePlan(planId, swapData)`
      // usando ethers.js o web3.eth.Contract según tu ABI.
      // Ejemplo (simulado):
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(`[TX] ✅ Swap completado en la red ${plan.network}`);
    } catch (error: any) {
      console.error(`[ERROR] ❌ executeSwapOnChain falló:`, error.message);
      throw error;
    }
  }
}
