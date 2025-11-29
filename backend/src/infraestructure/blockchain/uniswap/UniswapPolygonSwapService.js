import { ethers } from "ethers";
import logger from "../../../config/logger.ts";
import dotenv from "dotenv";
dotenv.config();
const UNISWAP_ROUTER = process.env.UNISWAP_ROUTER_POLYGON;
const UNISWAP_QUOTER = process.env.UNISWAP_QUOTER;
const ABI_ROUTER = [
    "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160)) payable returns (uint256)"
];
const ABI_QUOTER = [
    "function quoteExactInputSingle(address,address,uint24,uint256,uint160) external returns (uint256)"
];
export class UniswapPolygonSwapService {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY_RELAYER, this.provider);
        logger.info("🔵 UniswapPolygonSwapService inicializado (Polygon)");
    }
    async getQuote(tokenIn, tokenOut, amountInWei) {
        try {
            const quoter = new ethers.Contract(UNISWAP_QUOTER, ABI_QUOTER, this.provider);
            const expectedOut = await quoter.quoteExactInputSingle(tokenIn, tokenOut, 3000, amountInWei, 0);
            if (!expectedOut || expectedOut.eq(0)) {
                throw new Error("Uniswap devuelve amountOut = 0");
            }
            return expectedOut;
        }
        catch (error) {
            logger.error(`❌ Error en Uniswap.getQuote(): ${error}`);
            throw new Error("UniswapQuoteError");
        }
    }
    async executeSwap({ tokenIn, tokenOut, amountInWei, userAddress, slippageBps = 200 }) {
        logger.info(`🔄 [Uniswap] Ejecutando swap: ${tokenIn} → ${tokenOut}`);
        const router = new ethers.Contract(UNISWAP_ROUTER, ABI_ROUTER, this.wallet);
        // 1. QUOTE
        const estimatedOut = await this.getQuote(tokenIn, tokenOut, amountInWei);
        logger.info(`📊 [Uniswap] estimatedOut: ${estimatedOut}`);
        // 2. SLIPPAGE
        const minOut = estimatedOut.sub(estimatedOut.mul(slippageBps).div(10000));
        // 3. APPROVE
        const erc20Abi = [
            "function approve(address spender, uint256 value) external returns (bool)",
            "function allowance(address owner, address spender) external view returns (uint256)"
        ];
        const tokenContract = new ethers.Contract(tokenIn, erc20Abi, this.wallet);
        const allowance = await tokenContract.allowance(userAddress, UNISWAP_ROUTER);
        if (allowance.lt(amountInWei)) {
            logger.info("🟦 [Uniswap] Approving router...");
            const txApprove = await tokenContract.approve(UNISWAP_ROUTER, ethers.constants.MaxUint256);
            await txApprove.wait();
            logger.info("✅ [Uniswap] Allowance aprobado");
        }
        // 4. SWAP
        const params = {
            tokenIn,
            tokenOut,
            fee: 3000,
            recipient: userAddress,
            deadline: Math.floor(Date.now() / 1000) + 300,
            amountIn: amountInWei.toString(),
            amountOutMinimum: minOut.toString(),
            sqrtPriceLimitX96: 0
        };
        logger.info("🚀 [Uniswap] Enviando swap...");
        const tx = await router.exactInputSingle(params, {
            gasLimit: 350000,
        });
        logger.info(`⏳ [Uniswap] TX enviada: ${tx.hash}`);
        await tx.wait();
        logger.info(`✅ [Uniswap] Swap completado: ${tx.hash}`);
        return {
            txHash: tx.hash,
            estimatedOut: estimatedOut.toString(),
            minOut: minOut.toString(),
        };
    }
}
