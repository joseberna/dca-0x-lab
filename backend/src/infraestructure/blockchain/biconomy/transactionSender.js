import { biconomy } from "./biconomyClient";
import { publicClient } from "../blockchain.provider";
export async function sendTransaction({ to, data, value = 0n, gasless = false, }) {
    if (gasless) {
        console.log("⚡ Ejecutando transacción GASLESS con Biconomy...");
        const { waitForTxHash } = await biconomy.sendTransaction({
            to,
            data,
            value,
        });
        const hash = await waitForTxHash();
        console.log("🔥 Gasless TX hash:", hash);
        return hash;
    }
    // fallback normal (MATIC)
    return await publicClient.sendTransaction({
        account: process.env.PRIVATE_KEY_EXECUTOR,
        to,
        data,
        value,
    });
}
