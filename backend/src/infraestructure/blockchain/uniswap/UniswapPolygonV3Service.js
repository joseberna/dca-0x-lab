import { ethers } from "ethers";
import { FeeAmount } from "@uniswap/v3-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const QuoterV2ABI = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/IQuoterV2.sol/IQuoterV2.json");
// LOAD ABI SWAP ROUTER
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const routerAbiPath = path.resolve(__dirname, "./abi/SwapRouterV3.json");
const SwapRouterV3ABI = JSON.parse(fs.readFileSync(routerAbiPath, "utf-8"));
import { USDC_POLYGON, WBTC_POLYGON, WETH_POLYGON, WMATIC_POLYGON, } from "./tokens.polygon.ts";
import logger from "../../../config/logger.ts";
export class UniswapPolygonV3Service {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY_RELAYER, this.provider);
        this.quoter = new ethers.Contract(process.env.UNISWAP_QUOTER, QuoterV2ABI.abi, this.provider);
        this.router = new ethers.Contract(process.env.UNISWAP_ROUTER, SwapRouterV3ABI, this.wallet.connect(this.provider));
        logger.info("🦄 Uniswap V3 Router inicializado (Polygon)");
    }
    async executeSwapUSDCtoWBTC(amountUSDC) {
        logger.info(`🔄 Ejecutando swap USDC → WBTC (${amountUSDC} USDC)`);
        const amountIn = ethers.utils.parseUnits(amountUSDC.toString(), 6);
        const route = [USDC_POLYGON, WMATIC_POLYGON, WETH_POLYGON, WBTC_POLYGON];
        const fees = [FeeAmount.MEDIUM, FeeAmount.MEDIUM, FeeAmount.MEDIUM];
        const path = ethers.utils.solidityPack(["address", "uint24", "address", "uint24", "address", "uint24", "address"], [
            route[0].address, fees[0],
            route[1].address, fees[1],
            route[2].address, fees[2],
            route[3].address
        ]);
        const quote = await this.quoter.quoteExactInput(path, amountIn);
        const amountOutMin = quote.amountOut.mul(95).div(100); // slippage 5%
        logger.info(`💱 Estimado WBTC: ${ethers.utils.formatUnits(quote.amountOut, 8)}`);
        const usdcContract = new ethers.Contract(USDC_POLYGON.address, ["function approve(address spender, uint256 value) external returns (bool)"], this.wallet);
        const approval = await usdcContract.approve(this.router.address, amountIn);
        await approval.wait();
        const params = {
            path,
            recipient: this.wallet.address,
            deadline: Math.floor(Date.now() / 1000) + 1800,
            amountIn,
            amountOutMinimum: amountOutMin,
        };
        const tx = await this.router.exactInput(params);
        logger.info(`🚀 Swap enviado: ${tx.hash}`);
        await tx.wait();
        return tx.hash;
    }
}
