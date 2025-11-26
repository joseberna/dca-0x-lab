import axios from "axios";
import { ethers } from "ethers";

export class OneInchPolygonSwapService {
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;

  private readonly BASE_URL = "https://api.1inch.dev/swap/v6.0/137";
  private readonly API_KEY = process.env.ONEINCH_API_KEY!;

  constructor(provider: ethers.providers.JsonRpcProvider, wallet: ethers.Wallet) {
    this.provider = provider;
    this.wallet = wallet;
  }

  async getQuote(fromToken: string, toToken: string, amountWei: string, walletAddr: string) {
    const url = `${this.BASE_URL}/swap`;

    const params = {
      src: fromToken,
      dst: toToken,
      amount: amountWei,
      from: walletAddr,
      slippage: 0.5
    };

    const res = await axios.get(url, {
      params,
      headers: {
        Authorization: `Bearer ${this.API_KEY}`
      }
    });

    return res.data;
  }

  async sendSwapTx(swapData: any): Promise<string> {
    const txRequest = {
      to: swapData.tx.to,
      data: swapData.tx.data,
      value: swapData.tx.value ? ethers.BigNumber.from(swapData.tx.value) : 0,
      gasPrice: await this.provider.getGasPrice(),
      gasLimit: ethers.BigNumber.from("300000")
    };

    const tx = await this.wallet.sendTransaction(txRequest);
    return tx.hash;
  }
}
