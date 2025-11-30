import { createMeeClient, toMultichainNexusAccount, getMEEVersion, MEEVersion } from "@biconomy/abstractjs";
import { http } from "viem";
import { base, polygon } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
const bundler = process.env.BICONOMY_BUNDLER_URL;
const paymaster = process.env.BICONOMY_PAYMASTER_URL;
const apiKey = process.env.BICONOMY_API_KEY;
const projectId = process.env.BICONOMY_PROJECT_ID;
export async function getSmartAccountForUser(privateKey) {
    const eoa = privateKeyToAccount(privateKey);
    const meeClient = await createMeeClient({
        signer: eoa,
        bundlerUrl: bundler,
        paymasterUrl: paymaster,
        apiKey,
        projectId,
        transport: http()
    });
    const sa = await toMultichainNexusAccount({
        signer: eoa,
        chainConfigurations: [
            {
                chain: polygon,
                transport: http(),
                version: getMEEVersion(MEEVersion.V2_1_0),
            },
            {
                chain: base,
                transport: http(),
                version: getMEEVersion(MEEVersion.V2_1_0),
            }
        ],
    });
    return { sa, eoa };
}
