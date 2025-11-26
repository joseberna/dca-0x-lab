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
  
  private wbtcContract: ethers.Contract;
  private treasuryAddress: string;

  // Configuración
  private readonly LOW_BALANCE_THRESHOLD = 0.1; // 0.1 WBTC
  private readonly REFILL_AMOUNT = 1.0;         // 1.0 WBTC

  constructor() {
    // Configuración de red basada en ACTIVE_NETWORK
    const activeNetwork = process.env.ACTIVE_NETWORK || "sepolia";
    
    let rpcUrl: string;
    let wbtcAddress: string;
    let treasuryAddress: string;

    if (activeNetwork === "sepolia") {
      rpcUrl = process.env.RPC_URL_SEPOLIA!;
      wbtcAddress = process.env.SM_WBTC_SEPOLIA!;
      treasuryAddress = process.env.SM_TREASURYVAULT_SEPOLIA!;
    } else if (activeNetwork === "polygon") {
      rpcUrl = process.env.RPC_URL_POLYGON!;
      wbtcAddress = process.env.WBTC_POLYGON!;
      treasuryAddress = process.env.DCA_TREASURY_ADDRESS!;
    } else {
      throw new Error(`Invalid ACTIVE_NETWORK: ${activeNetwork}`);
    }

    if (!rpcUrl || !wbtcAddress || !treasuryAddress) {
      throw new Error(`Missing configuration for network: ${activeNetwork}`);
    }

    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) throw new Error("PRIVATE KEY no configurada");

    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.treasuryAddress = treasuryAddress;
    this.wbtcContract = new ethers.Contract(wbtcAddress, ERC20_ABI, this.wallet);
    
    logger.info(`🏦 TreasuryService inicializado en red: ${activeNetwork}`);
    logger.info(`📍 Treasury Vault: ${this.treasuryAddress}`);
  }

  /**
   * Chequea la salud del inventario y recarga si es necesario.
   * Monitorea tanto el Treasury WBTC como el UserVault USDC para batch swaps.
   */
  async checkAndRefill(): Promise<void> {
    try {
        // 1. Verificar balance de WBTC en Treasury
        const wbtcBalanceWei = await this.wbtcContract.balanceOf(this.treasuryAddress);
        const wbtcBalance = parseFloat(ethers.utils.formatUnits(wbtcBalanceWei, 8));

        logger.info(`💰 Balance Treasury (WBTC): ${wbtcBalance.toFixed(4)} WBTC`, { service: 'TreasuryService', method: 'checkAndRefill' });

        // 2. Verificar acumulación de USDC en UserVault
        await this.checkUserVaultAndSwap();

        // 3. Si Treasury está bajo, recargar
        if (wbtcBalance < this.LOW_BALANCE_THRESHOLD) {
            // 🚨 ALERTA GIGANTE PARA EL ADMIN
            logger.error(`\n${"🚨".repeat(40)}`);
            logger.error(`${"█".repeat(80)}`);
            logger.error(`█${" ".repeat(78)}█`);
            logger.error(`█  ⚠️  ALERTA CRÍTICA: TREASURY WBTC BAJO  ⚠️${" ".repeat(32)}█`);
            logger.error(`█${" ".repeat(78)}█`);
            logger.error(`█  Balance actual: ${wbtcBalance.toFixed(8)} WBTC${" ".repeat(50 - wbtcBalance.toFixed(8).length)}█`);
            logger.error(`█  Threshold mínimo: ${this.LOW_BALANCE_THRESHOLD} WBTC${" ".repeat(50 - this.LOW_BALANCE_THRESHOLD.toString().length)}█`);
            logger.error(`█${" ".repeat(78)}█`);
            logger.error(`█  🔴 ACCIÓN REQUERIDA: RECARGA MANUAL NECESARIA 🔴${" ".repeat(28)}█`);
            logger.error(`█${" ".repeat(78)}█`);
            logger.error(`${"█".repeat(80)}`);
            logger.error(`${"🚨".repeat(40)}\n`);
            
            await this.refillInventory();
        } else {
            logger.info(`✅ Treasury saludable.`, { service: 'TreasuryService', method: 'checkAndRefill' });
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
      // En testnet, simulamos el swap minteando WBTC equivalente
      logger.info(`🧪 Testnet: Simulando swap de ${usdcAmount.toFixed(2)} USDC → WBTC`, { service: 'TreasuryService', method: 'executeBatchSwap' });
      
      // Precio simulado: 1 WBTC = 50,000 USDC
      const wbtcPrice = 50000;
      const wbtcAmount = usdcAmount / wbtcPrice;
      
      logger.info(`   💱 Swap: ${usdcAmount.toFixed(2)} USDC → ${wbtcAmount.toFixed(8)} WBTC (precio: $${wbtcPrice.toLocaleString()})`, { service: 'TreasuryService', method: 'executeBatchSwap' });
      
      try {
        const wbtcAmountWei = ethers.utils.parseUnits(wbtcAmount.toFixed(8), 8);
        const tx = await this.wbtcContract.mint(this.treasuryAddress, wbtcAmountWei);
        logger.info(`⏳ Minteando WBTC... Hash: ${tx.hash}`, { service: 'TreasuryService', method: 'executeBatchSwap', txHash: tx.hash });
        await tx.wait();
        logger.info(`\n${'$'.repeat(80)}`, { service: 'TreasuryService' });
        logger.info(`✅ BATCH SWAP COMPLETADO`, { service: 'TreasuryService', method: 'executeBatchSwap' });
        logger.info(`${'$'.repeat(80)}`, { service: 'TreasuryService' });
        logger.info(`📥 USDC consumido: ${usdcAmount.toFixed(2)} USDC`, { service: 'TreasuryService', method: 'executeBatchSwap' });
        logger.info(`📤 WBTC minteado: +${wbtcAmount.toFixed(8)} WBTC`, { service: 'TreasuryService', method: 'executeBatchSwap' });
        logger.info(`🏦 Destino: Treasury Vault`, { service: 'TreasuryService', method: 'executeBatchSwap' });
        logger.info(`${'$'.repeat(80)}\n`, { service: 'TreasuryService' });
      } catch (error: any) {
        logger.error(`❌ Error en batch swap: ${error.message}`);
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
        logger.info("🧪 Modo Testnet: Minteando WBTC de emergencia...");
        try {
            const amountWei = ethers.utils.parseUnits(this.REFILL_AMOUNT.toString(), 8);
            const tx = await this.wbtcContract.mint(this.treasuryAddress, amountWei);
            logger.info(`⏳ Minteando... Hash: ${tx.hash}`);
            await tx.wait();
            logger.info(`✅ Recarga de emergencia completada: +${this.REFILL_AMOUNT} WBTC`);
        } catch (error: any) {
            logger.error(`❌ Falló el minteo: ${error.message}`);
        }
    } else {
        logger.warn("🚧 Modo Mainnet: Recarga manual requerida o swap automático desde fondos del protocolo.");
    }
  }
}
