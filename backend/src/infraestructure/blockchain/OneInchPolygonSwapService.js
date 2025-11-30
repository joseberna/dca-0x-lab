import axios from "axios";
import { ethers } from "ethers";
export class OneInchPolygonSwapService {
    constructor(provider, wallet) {
        this.BASE_URL = "https://api.1inch.dev/swap/v6.0/137";
        this.API_KEY = process.env.ONEINCH_API_KEY;
        this.provider = provider;
        this.wallet = wallet;
    }
    async getQuote(fromToken, toToken, amountWei, walletAddr) {
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
    async sendSwapTx(swapData) {
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
