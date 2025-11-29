import { getSmartAccountForUser } from "./biconomy.client";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// LOAD ABI SWAP ROUTER
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routerAbiPath = path.resolve(
  __dirname,
  "../../infraestructure/blockchain/abi/SwapRouter.json"
);

const SwapRouterABI = JSON.parse(fs.readFileSync(routerAbiPath, "utf-8"));

const erc20ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)"
];

export async function gaslessDCA(plan: any) {
  const userPk = plan.userPrivateKey; // <<------- IMPORTANTE, viene del usuario
  const { sa } = await getSmartAccountForUser(userPk);

  const usdc = ethers.utils.getAddress(process.env.SM_USDC_POLYGON!);
  const router = ethers.utils.getAddress(process.env.UNISWAP_ROUTER_POLYGON!);

  const tokenOut =
    plan.tokenTo === "WETH"
      ? ethers.utils.getAddress(process.env.SM_WETH_POLYGON!)
      : ethers.utils.getAddress(process.env.SM_WBTC_POLYGON!);

  const amountIn = ethers.utils.parseUnits(
    plan.amountPerInterval.toString(),
    6
  );

  // 1. Encode approval
  const approveIface = new ethers.utils.Interface(erc20ABI);
  const approveCalldata = approveIface.encodeFunctionData("approve", [
    router,
    ethers.constants.MaxUint256,
  ]);

  // 2. Encode swap
  const routerIface = new ethers.utils.Interface(SwapRouterABI.abi);

  const swapCalldata = routerIface.encodeFunctionData("exactInputSingle", [{
    tokenIn: usdc,
    tokenOut,
    fee: 3000,
    recipient: sa.address,       // Smart Account Recibe los tokens swappeados
    deadline: Math.floor(Date.now() / 1000) + 300,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  }]);

  // 3. Batch approve + swap
  const calls = [
    { to: usdc, data: approveCalldata },
    { to: router, data: swapCalldata }
  ];

  // 4. Build UserOp
  const userOp = await sa.buildUserOp({ calls });

  // 5. Sponsor with Paymaster
  const sponsored = await sa.sponsorUserOp(userOp);

  // 6. Send UserOperation
  const result = await sa.sendSponsoredUserOp(sponsored);

  return {
    taskId: result.taskId,
    userOpHash: result.userOpHash,
    saAddress: sa.address,
  };
}
