import { ethers } from "ethers";
import { AlphaRouter, SwapType } from "@uniswap/smart-order-router";
import {
    CurrencyAmount,
    TradeType,
    Percent,
    Token
} from "@uniswap/sdk-core";
import JSBI from "jsbi";
import logger from "../../../config/logger.ts";

export class UniswapPolygonSmartRouterService {

    private provider: ethers.providers.JsonRpcProvider;
    private wallet: ethers.Wallet;
    private router: AlphaRouter;
    private USDC: Token;
    private WBTC: Token;

    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC);
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY_RELAYER!, this.provider);

        this.router = new AlphaRouter({
            chainId: 137,
            provider: this.provider,
        });

        this.USDC = new Token(137, process.env.USDC_POLYGON!, 6, "USDC", "USD Coin");
        this.WBTC = new Token(137, process.env.WBTC_POLYGON!, 8, "WBTC", "Wrapped Bitcoin");

        logger.info("🟣 Uniswap Smart Router inicializado (Polygon)");
    }

    async executeSwapUSDCtoWBTC(amountUSDC: number): Promise<string> {
        logger.info(`🔄 Ejecutando Smart Swap USDC → WBTC (${amountUSDC} USDC)`);

        // USDC → raw amount
        const amountIn = CurrencyAmount.fromRawAmount(
            this.USDC,
            JSBI.BigInt(Math.floor(amountUSDC * 1e6)) // USDC tiene 6 decimales
        );

        const slippage = new Percent(JSBI.BigInt(100), JSBI.BigInt(10_000)); // 1%

        // MULTIHOP ROUTE
        const route = await this.router.route(
            amountIn,
            this.WBTC,
            SwapType.UNIVERSAL_ROUTER,
            {
                recipient: this.wallet.address,
                slippageTolerance: slippage,
                deadline: Math.floor(Date.now() / 1000) + 1800,
            }
        );


        if (!route) throw new Error("❌ Uniswap no encontró ruta multihop");

        logger.info(`🧠 Ruta encontrada: ${route.route[0].path.map(p => p.symbol).join(" → ")}`);
        logger.info(`💱 Monto estimado WBTC: ${route.quote.toFixed(8)}`);

        const tx = {
            to: route.methodParameters!.to,
            data: route.methodParameters!.calldata,
            value: route.methodParameters!.value,
            gasLimit: 700000,
        };

        const sentTx = await this.wallet.sendTransaction(tx);
        logger.info(`🚀 TX enviada: ${sentTx.hash}`);

        return sentTx.hash;
    }
}
