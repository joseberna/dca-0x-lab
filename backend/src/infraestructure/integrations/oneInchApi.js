import axios from "axios";
import logger from "../../config/logger.ts";
export class OneInchApi {
    constructor() {
        this.baseUrl = process.env.ONEINCH_API_BASE;
        this.apiKey = process.env.ONEINCH_API_KEY;
    }
    async buildSwap(fromToken, toToken, amount, wallet) {
        try {
            if (!this.baseUrl || !this.apiKey) {
                throw new Error("❌ Missing ONEINCH_API_BASE or ONEINCH_API_KEY");
            }
            const url = `${this.baseUrl}/swap?fromTokenAddress=${fromToken}&toTokenAddress=${toToken}&amount=${amount}&fromAddress=${wallet}&slippage=1`;
            logger.info(`🔗 Calling 1inch API: ${url}`);
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${this.apiKey}` },
            });
            logger.info(`🧾 Raw response from 1inch:  ${response.data}`);
            return response.data;
        }
        catch (err) {
            if (err.response) {
                logger.error(`❌ Error fetching swap data: ${err.response.status} ${err.response.statusText}`);
                logger.error(JSON.stringify(err.response.data, null, 2));
            }
            else {
                logger.error(`❌ Error fetching swap data: ${err.message}`);
            }
            throw new Error("1inch swap failed");
        }
    }
}
