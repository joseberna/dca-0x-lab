import { Token } from "@uniswap/sdk-core";
import dotenv from "dotenv";

dotenv.config();

export const USDC_POLYGON = new Token(
  137,
  process.env.SM_USDC_POLYGON!, // USDC NATIVO - NO USDC.e
  6,
  "USDC",
  "USD Coin (Native)"
);

export const WBTC_POLYGON = new Token(
  137,
  process.env.WBTC_POLYGON!,
  8,
  "WBTC",
  "Wrapped Bitcoin"
);

export const WMATIC_POLYGON = new Token(
  137,
  process.env.WMATIC_POLYGON!,
  18,
  "WMATIC",
  "Wrapped MATIC"
);

export const WETH_POLYGON = new Token(
  137,
  process.env.WETH_POLYGON!,
  18,
  "WETH",
  "Wrapped Ether"
);
