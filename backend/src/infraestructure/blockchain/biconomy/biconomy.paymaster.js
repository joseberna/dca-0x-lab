// src/infraestructure/blockchain/biconomy.paymaster.ts
import { createSmartAccountClient } from "@biconomy/account";
import { polygon } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { http } from "viem";
const relayer = privateKeyToAccount(process.env.PRIVATE_KEY_RELAYER);
export const paymaster = createSmartAccountClient({
    signer: relayer,
    chain: polygon,
    transport: http(),
    bundler: {
        url: process.env.BICONOMY_BUNDLER_URL,
    },
    paymaster: {
        url: process.env.BICONOMY_PAYMASTER_URL,
    },
});
