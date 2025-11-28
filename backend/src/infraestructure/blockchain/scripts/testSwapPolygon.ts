import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const router = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const usdc = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const weth = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

const abi = [
  "function exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160)) payable returns (uint256)"
];

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL_POLYGON);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  console.log("Wallet:", wallet.address);

  const routerC = new ethers.Contract(router, abi, wallet);

  const amountIn = ethers.utils.parseUnits("1", 6); // 1 USDC

  const params = {
    tokenIn: usdc,
    tokenOut: weth,
    fee: 3000,
    recipient: wallet.address,
    deadline: Math.floor(Date.now() / 1000) + 300,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  };

  console.log("Ejecutando swap...");

  const tx = await routerC.exactInputSingle(params, {
    gasLimit: 600000
  });

  console.log("TX:", tx.hash);

  const receipt = await tx.wait();
  console.log("Confirmada en bloque:", receipt.blockNumber);
}

main();
