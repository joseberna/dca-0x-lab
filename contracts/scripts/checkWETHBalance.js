const { ethers } = require("hardhat");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../backend/.env") });

async function main() {
  const wethAddress = process.env.SEPOLIA_WETH_TOKEN;
  const userAddress = "0x0C1ee65e59Cd82C1C6FF3bc0d5E612190F45264D";

  console.log("\n🔍 Checking WETH Balance");
  console.log("========================");
  console.log("WETH:", wethAddress);
  console.log("User:", userAddress);
  console.log("========================\n");

  const weth = await ethers.getContractAt("MockWETH", wethAddress);

  const balance = await weth.balanceOf(userAddress);
  const decimals = await weth.decimals();

  console.log(`Balance (wei): ${balance.toString()}`);
  console.log(`Decimals: ${decimals}`);
  console.log(`Balance (human): ${ethers.formatUnits(balance, decimals)} WETH`);
  console.log("\n========================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
