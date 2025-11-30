import { ethers } from "ethers";
import dotenv from "dotenv";
import logger from "../../config/logger.ts";

dotenv.config();

// ABI mínimo para ERC20 (balanceOf, mint)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function mint(address to, uint256 amount) external" // Solo para MockWBTC
];

export class TreasuryService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  private tokenContract: ethers.Contract;
  private treasuryAddress: string;
  private tokenSymbol: string;
  private usdcAddress: string;

  // Configuración
  private readonly LOW_BALANCE_THRESHOLD: number;
  private readonly REFILL_AMOUNT: number;

  constructor(config: {
    tokenSymbol: string;
    tokenAddress: string;
    treasuryAddress: string;
    lowBalanceThreshold: number;
    refillAmount: number;
  }) {
    this.tokenSymbol = config.tokenSymbol;
    this.treasuryAddress = config.treasuryAddress;
    this.LOW_BALANCE_THRESHOLD = config.lowBalanceThreshold;
    this.REFILL_AMOUNT = config.refillAmount;

    // Configuración de red basada en ACTIVE_NETWORK
    const activeNetwork = process.env.ACTIVE_NETWORK || "sepolia";
    let rpcUrl: string;

    if (activeNetwork === "sepolia") {
      rpcUrl = process.env.RPC_URL_SEPOLIA!;
      // Use new variable for USDC
      this.usdcAddress = process.env.SEPOLIA_USDC_TOKEN || process.env.SM_USDC_SEPOLIA!;
    } else if (activeNetwork === "polygon") {
      rpcUrl = process.env.RPC_URL_POLYGON!;
      this.usdcAddress = process.env.USDC_POLYGON!;
    } else {
      throw new Error(`Invalid ACTIVE_NETWORK: ${activeNetwork}`);
    }
    // logger.info(`🔌 RPC URL: ${rpcUrl}`, { service: 'TreasuryService', method: 'constructor' });
    // logger.info(`🔌 Configuración: ${JSON.stringify(config)}`, { service: 'TreasuryService', method: 'constructor' });

    if (!rpcUrl || !config.tokenAddress || !config.treasuryAddress) {
      throw new Error(`Missing configuration for ${this.tokenSymbol} on ${activeNetwork}`);
    }

    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE KEY no configurada");

    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.tokenContract = new ethers.Contract(config.tokenAddress, ERC20_ABI, this.wallet);

    logger.info(`🏦 TreasuryService (${this.tokenSymbol}) inicializado en red: ${activeNetwork}`);
    logger.info(`📍 Vault: ${this.treasuryAddress}`);
  }

  /**
   * Chequea la salud del inventario y recarga si es necesario.
   * Monitorea tanto el Treasury WBTC como el UserVault USDC para batch swaps.
   */
  async checkAndRefill(): Promise<void> {
    try {
      // 1. Verificar balance de WBTC en Treasury
      const balanceWei = await this.tokenContract.balanceOf(this.treasuryAddress);
      const balance = parseFloat(ethers.utils.formatUnits(balanceWei, this.tokenSymbol === 'USDC' ? 6 : (this.tokenSymbol === 'WBTC' ? 8 : 18)));

      logger.info(`💰 Balance Treasury (${this.tokenSymbol}): ${balance.toFixed(4)} ${this.tokenSymbol}`, { service: 'TreasuryService', method: 'checkAndRefill' });

      // 2. Verificar acumulación de USDC en UserVault
      await this.checkUserVaultAndSwap();

      // 3. Si Treasury está bajo, recargar
      if (balance < this.LOW_BALANCE_THRESHOLD) {
        // 🚨 ALERTA GIGANTE PARA EL ADMIN
        logger.error(`\n${"🚨".repeat(40)}`);
        logger.error(`${"█".repeat(80)}`);
        logger.error(`█${" ".repeat(78)}█`);
        logger.error(`█  ⚠️  ALERTA CRÍTICA: TREASURY ${this.tokenSymbol} BAJO  ⚠️${" ".repeat(32)}█`);
        logger.error(`█${" ".repeat(78)}█`);
        logger.error(`█  Balance actual: ${balance.toFixed(8)} ${this.tokenSymbol}${" ".repeat(50 - balance.toFixed(8).length)}█`);
        logger.error(`█  Threshold mínimo: ${this.LOW_BALANCE_THRESHOLD} ${this.tokenSymbol}${" ".repeat(50 - this.LOW_BALANCE_THRESHOLD.toString().length)}█`);
        logger.error(`█${" ".repeat(78)}█`);
        logger.error(`█  🔴 ACCIÓN REQUERIDA: RECARGA MANUAL NECESARIA 🔴${" ".repeat(28)}█`);
        logger.error(`█${" ".repeat(78)}█`);
        logger.error(`${"█".repeat(80)}`);
        logger.error(`${"🚨".repeat(40)}\n`);

        await this.refillInventory();
      } else {
        logger.info(`✅ Treasury (${this.tokenSymbol}) saludable.`, { service: 'TreasuryService', method: 'checkAndRefill' });
      }

    } catch (error: any) {
      logger.error(`❌ Error en TreasuryService: ${error.message}`);
    }
  }

  /**
   * Verifica si UserVault tiene suficiente USDC acumulado para hacer batch swap.
   */
  private async checkUserVaultAndSwap(): Promise<void> {
    const activeNetwork = process.env.ACTIVE_NETWORK || "sepolia";

    let userVaultAddress: string;
    let usdcAddress: string;

    if (activeNetwork === "sepolia") {
      userVaultAddress = process.env.SM_USERVAULT_SEPOLIA!;
      usdcAddress = process.env.SM_USDC_SEPOLIA!;
    } else {
      userVaultAddress = process.env.DCA_USERVAULT_ADDRESS!;
      usdcAddress = process.env.USDC_POLYGON!;
    }

    // ABI mínimo para USDC
    const USDC_ABI = ["function balanceOf(address owner) view returns (uint256)"];
    const usdcContract = new ethers.Contract(usdcAddress, USDC_ABI, this.provider);

    // Verificar balance de USDC en UserVault
    const usdcBalanceWei = await usdcContract.balanceOf(userVaultAddress);
    const usdcBalance = parseFloat(ethers.utils.formatUnits(usdcBalanceWei, 6));

    logger.info(`💵 UserVault USDC acumulado: ${usdcBalance.toFixed(2)} USDC`, { service: 'TreasuryService', method: 'checkUserVaultAndSwap' });

    // Threshold para batch swap (ej: 200 USDC)
    const BATCH_SWAP_THRESHOLD = 200;

    if (usdcBalance >= BATCH_SWAP_THRESHOLD) {
      logger.info(`\n${'$'.repeat(80)}`, { service: 'TreasuryService' });
      logger.info(`🔄 UserVault alcanzó threshold (${BATCH_SWAP_THRESHOLD} USDC). Ejecutando batch swap...`, { service: 'TreasuryService', method: 'checkUserVaultAndSwap' });
      logger.info(`${'$'.repeat(80)}\n`, { service: 'TreasuryService' });
      await this.executeBatchSwap(usdcBalance);
    }
  }

  /**
   * Ejecuta un batch swap de USDC acumulado en UserVault → WBTC para Treasury.
   * - Testnet: Mintea WBTC equivalente
   * - Mainnet: Ejecuta swap real via Uniswap/0x
   */
  private async executeBatchSwap(usdcAmount: number): Promise<void> {
    const activeNetwork = process.env.ACTIVE_NETWORK || "sepolia";
    const isTestnet = activeNetwork === "sepolia";

    if (isTestnet) {
      // En testnet, simulamos el swap minteando el token equivalente
      logger.info(`🧪 Testnet: Simulando swap de ${usdcAmount} USDC → ${this.tokenSymbol}`, { service: 'TreasuryService', method: 'executeBatchSwap' });

      // Simular precio (ej. 50,000 USDC/BTC o 2,000 USDC/ETH)
      const price = this.tokenSymbol === 'WBTC' ? 50000 : 2000; // Default to 2000 for other tokens
      const amountOut = usdcAmount / price;

      logger.info(`   💱 Swap: ${usdcAmount.toFixed(2)} USDC → ${amountOut.toFixed(8)} ${this.tokenSymbol} (precio: $${price})`, { service: 'TreasuryService', method: 'executeBatchSwap' });

      try {
        // Mint Token (simulado)
        if (this.tokenContract.mint) {
          const amountOutWei = ethers.utils.parseUnits(amountOut.toString(), this.tokenSymbol === 'WBTC' ? 8 : 18);
          const tx = await this.tokenContract.mint(this.treasuryAddress, amountOutWei);

          logger.info(`⏳ Minteando ${this.tokenSymbol}... Hash: ${tx.hash}`, { service: 'TreasuryService', method: 'executeBatchSwap', txHash: tx.hash });
          await tx.wait();
        }

        logger.info(`\n${"$".repeat(80)}`, { service: 'TreasuryService' });
        logger.info(`✅ BATCH SWAP COMPLETADO (${this.tokenSymbol})`, { service: 'TreasuryService', method: 'executeBatchSwap' });
        logger.info(`${"$".repeat(80)}`, { service: 'TreasuryService' });
        logger.info(`📥 USDC consumido: ${usdcAmount.toFixed(2)} USDC`, { service: 'TreasuryService', method: 'executeBatchSwap' });
        logger.info(`📤 ${this.tokenSymbol} minteado: +${amountOut.toFixed(8)} ${this.tokenSymbol}`, { service: 'TreasuryService', method: 'executeBatchSwap' });
        logger.info(`🏦 Destino: Treasury Vault`, { service: 'TreasuryService', method: 'executeBatchSwap' });
        logger.info(`${"$".repeat(80)}\n`, { service: 'TreasuryService' });
      } catch (error: any) {
        logger.error(`❌ Error en batch swap: ${error.message}`, { service: 'TreasuryService', method: 'executeBatchSwap' });
      }
    } else {
      // En mainnet, ejecutar swap real
      logger.info(`🔄 Mainnet: Ejecutando swap real de ${usdcAmount} USDC → WBTC`);
      logger.warn("🚧 Swap real vía Uniswap/0x aún no implementado.");
      // TODO: Implementar swap real usando Uniswap Router o 0x API
    }
  }

  /**
   * Recarga directa del Treasury (fallback si está muy bajo).
   * - Sepolia: Mintea MockWBTC.
   * - Mainnet: Requiere fondos externos.
   */
  private async refillInventory(): Promise<void> {
    const activeNetwork = process.env.ACTIVE_NETWORK || "sepolia";
    const isTestnet = activeNetwork === "sepolia";

    if (isTestnet) {
      // En Testnet, simplemente minteamos más tokens (si es Mock)
      // En Mainnet, aquí iría la lógica de swap real (Uniswap/1inch)

      // Check if it's a mock by checking if 'mint' exists
      if (this.tokenContract.mint) {
        logger.info(`🧪 Testnet: Minteando ${this.REFILL_AMOUNT} ${this.tokenSymbol} para Treasury...`);

        const amountWei = ethers.utils.parseUnits(this.REFILL_AMOUNT.toString(), this.tokenSymbol === 'WBTC' ? 8 : 18);
        const tx = await this.tokenContract.mint(this.treasuryAddress, amountWei);

        logger.info(`⏳ Minteando... Hash: ${tx.hash}`);
        await tx.wait();

        logger.info(`✅ Recarga completada: +${this.REFILL_AMOUNT} ${this.tokenSymbol}`);
      } else {
        logger.warn(`⚠️ No se puede recargar automáticamente en Mainnet (no es Mock)`);
      }
    } else {
      logger.warn("🚧 Modo Mainnet: Recarga manual requerida o swap automático desde fondos del protocolo.");
    }
  }
}
