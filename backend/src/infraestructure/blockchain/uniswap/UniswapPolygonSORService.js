// src/infraestructure/blockchain/uniswap/UniswapPolygonSORService.ts
import { ethers } from "ethers";
import axios from "axios";
import logger from "../../../config/logger.ts";
export class UniswapPolygonSORService {
    constructor(provider, wallet) {
        this.provider = provider;
        this.wallet = wallet;
        logger.info("🟣 Uniswap Smart Order Router inicializado (Polygon)");
    }
    async getSORQuote(tokenIn, tokenOut, amountInWei) {
        const url = "https://api.uniswap.org/v2/quote";
        const params = {
            tokenIn,
            tokenOut,
            amount: amountInWei.toString(),
            protocols: "v3",
            chainId: 137,
            type: "exactInput",
        };
        const { data } = await axios.get(url, { params });
        return data;
    }
    async executeSwap(tokenIn, tokenOut, amountInWei) {
        try {
            // 1. Obtener quote de SOR
            const quote = await this.getSORQuote(tokenIn, tokenOut, amountInWei);
            const routerAddress = quote.routerAddress; // garantizado por Uniswap
            const calldata = quote.calldata; // calldata exacto del router
            logger.info(`💱 SOR amountOut: ${quote.quote.toString()}`);
            logger.info(`🧭 Ruta elegida por Uniswap: ${quote.routeString}`);
            // 2. Aprobar token in (si no está aprobado)
            const erc20 = new ethers.Contract(tokenIn, ["function allowance(address,address) view returns (uint256)",
                "function approve(address,uint256) returns (bool)"], this.wallet);
            const allowance = await erc20.allowance(this.wallet.address, routerAddress);
            if (allowance.lt(amountInWei)) {
                logger.info(`🔓 Aprobando ${tokenIn} para SmartRouter...`);
                const tx = await erc20.approve(routerAddress, amountInWei);
                await tx.wait();
            }
            // 3. Ejecutar swap
            logger.info("🚀 Ejecutando swap vía Smart Order Router...");
            const tx = await this.wallet.sendTransaction({
                to: routerAddress,
                data: calldata,
                gasLimit: 450000, // recomendado para Polygon
            });
            logger.info(`📤 TX enviada: ${tx.hash}`);
            await tx.wait();
            return tx.hash;
        }
        catch (err) {
            logger.error(`❌ SOR Error: ${err.message}`);
            if (err.response?.status === 409) {
                throw new Error("Uniswap SOR: no route found (input too small or pool too low)");
            }
            throw err;
        }
    }
}
