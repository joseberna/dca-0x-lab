import { ethers } from "ethers";
import logger from "../../config/logger.ts";

export class ZeroXPolygonSwapService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private ZEROX_URL: string;

  constructor(provider: ethers.providers.JsonRpcProvider, wallet: ethers.Wallet) {
    this.provider = provider;
    this.wallet = wallet;
    this.ZEROX_URL = "https://polygon.api.0x.org/swap/v1/quote";
  }

  /**
   * Obtener quote desde 0x
   */
  async getQuote(tokenIn: string, tokenOut: string, amountInWei: string) {
    const url =
      `${this.ZEROX_URL}?buyToken=${tokenOut}` +
      `&sellToken=${tokenIn}` +
      `&sellAmount=${amountInWei}` +
      `&takerAddress=${this.wallet.address}` +
      `&slippageBps=50`; // 0.5%

    logger.info(`📡 Fetching 0x quote → ${url}`);

    const res = await fetch(url);

    if (!res.ok) {
      const errTxt = await res.text();
      logger.error(`❌ 0x Quote Error → ${errTxt}`);
      throw new Error("❌ 0x quote error");
    }

    const quote = await res.json();

    if (!quote.to || !quote.data) {
      logger.error(`❌ Invalid quote →`, quote);
      throw new Error("❌ Invalid 0x quote: missing data/to fields");
    }

    return quote;
  }

  /**
   * Aprobar si allowance = 0
   */
  async ensureAllowance(usdcAddress: string, amount: string, allowanceTarget: string) {
    const erc20 = new ethers.Contract(
      usdcAddress,
      [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function approve(address spender, uint256 amount) returns (bool)"
      ],
      this.wallet
    );

    const allowance = await erc20.allowance(this.wallet.address, allowanceTarget);

    if (allowance.gt(0)) {
      logger.info("🟢 Allowance existente, no se requiere aprobar.");
      return;
    }

    logger.info(`🟡 Approving USDC → target: ${allowanceTarget}`);

    const tx = await erc20.approve(allowanceTarget, ethers.constants.MaxUint256);

    await tx.wait();
    logger.info(`✔ USDC approved → TX: ${tx.hash}`);
  }

  /**
   * Ejecutar swap con 0x
   */
  async executeSwap(quote: any) {
    logger.info(`🔄 Ejecutando swap vía 0x...`);

    const tx = await this.wallet.sendTransaction({
      to: quote.to,
      data: quote.data,
      value: quote.value || 0,
      gasLimit: 600000
    });

    logger.info(`📤 Swap enviado → ${tx.hash}`);

    const receipt = await tx.wait();
    logger.info(`✅ Swap confirmado → ${receipt.transactionHash}`);

    return receipt.transactionHash;
  }
}
