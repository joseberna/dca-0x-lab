import { ethers } from "ethers";
import { config } from "../../config/env.js";
import MockUSDC from "./contracts/MockUSDC.json" assert { type: "json" };
import DCAEngine from "./contracts/DCAEngine.json" assert { type: "json" };

const provider = new ethers.JsonRpcProvider(config.RPC_URL);
const wallet = new ethers.Wallet(config.PRIVATE_KEY, provider);

export const mockUSDC = new ethers.Contract(config.MOCK_USDC_ADDRESS, MockUSDC.abi, wallet);
export const dcaEngine = new ethers.Contract(config.DCA_ENGINE_ADDRESS, DCAEngine.abi, wallet);

export { provider, wallet };
