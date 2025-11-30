import { createMeeClient, toMultichainNexusAccount, getMEEVersion, MEEVersion, } from "@biconomy/abstractjs";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { polygon } from "viem/chains";
export async function createSmartAccount() {
    const signer = privateKeyToAccount(process.env.PRIVATE_KEY_RELAYER);
    const meeClient = await createMeeClient({
        signer,
        transport: http(process.env.RPC_POLYGON_MAINNET),
    });
    const smartAccount = await toMultichainNexusAccount({
        signer,
        chainConfigurations: [
            {
                chain: polygon,
                transport: http(process.env.RPC_POLYGON_MAINNET),
                version: getMEEVersion(MEEVersion.V2_1_0),
            },
        ],
    });
    return { meeClient, smartAccount };
}
