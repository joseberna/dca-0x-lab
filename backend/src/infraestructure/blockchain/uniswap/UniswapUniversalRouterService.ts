import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import logger from "../../../config/logger.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const universalRouterPath = path.resolve(__dirname, "./abi/UniversalRouter.json");
const UniversalABI = JSON.parse(fs.readFileSync(universalRouterPath, "utf-8")).abi;

export class UniswapUniversalRouterService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private universalRouter: ethers.Contract;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY_RELAYER!, this.provider);

    this.universalRouter = new ethers.Contract(
      process.env.UNISWAP_UNIVERSAL_ROUTER!,
      UniversalABI,           // ⬅️ SOLO EL ARRAY ABI
      this.wallet
    );

    logger.info("🧩 Universal Router inicializado");
  }

  async swapExactInputUSDCtoWBTC(amountUSDC: number): Promise<string> {
    logger.info(`🔄 Ejecutando Universal Router: USDC → WBTC | ${amountUSDC} USDC`);

    const amountIn = ethers.utils.parseUnits(amountUSDC.toString(), 6);

    // Comando: ejecutar swap V3 exactInput
    const COMMAND_SWAP_V3 = "0x00"; // ejemplo

    const commands = COMMAND_SWAP_V3;

    const inputs = [
      ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint256"],
        [
          process.env.SM_USDC_POLYGON,
          process.env.SM_WBTC_POLYGON,
          amountIn
        ]
      )
    ];

    const tx = await this.universalRouter.execute(
      commands,
      inputs,
      { value: 0 }
    );

    logger.info(`🚀 Universal Router TX enviada: ${tx.hash}`);
    return tx.hash;
  }
}
