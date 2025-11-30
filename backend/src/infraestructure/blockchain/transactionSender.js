import { ethers } from "ethers";
import dotenv from "dotenv";
import logger from "../../config/logger.ts";
dotenv.config();
export async function sendTransaction(txData) {
    try {
        const privateKey = process.env.PRIVATE_KEY?.trim();
        if (!privateKey || !privateKey.startsWith("0x") || privateKey.length !== 66) {
            throw new Error("Invalid private key");
        }
        const tx = txData.tx || txData;
        if (!tx.to || !tx.data)
            throw new Error("⚠️ [ST] Incomplete tx object");
        if (!txData)
            throw new Error("⚠️ [ST] Incomplete tx object");
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(privateKey, provider);
        logger.info(`🧠 [ST] Preparing transaction to ${tx.to}...`);
        const txResponse = await wallet.sendTransaction({
            to: tx.to,
            data: tx.data,
            value: BigInt(tx.value || 0),
            gasLimit: tx.gas ? BigInt(tx.gas) : undefined,
            gasPrice: tx.gasPrice ? BigInt(tx.gasPrice) : undefined,
        });
        logger.info(`📤 [ST] Transaction sent: ${txResponse.hash}`);
        await txResponse.wait();
        logger.info(`✅ [ST] Confirmed at block: ${txResponse.blockNumber}`);
        return txResponse.hash;
    }
    catch (err) {
        logger.error(`❌ Error sending transaction: ${err.message}`);
        throw err;
    }
}
