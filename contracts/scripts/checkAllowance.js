const { ethers } = require("hardhat");
require("dotenv").config({ path: "../backend/.env" });

async function main() {
  const userAddress = "0x0C1ee65e59Cd82C1C6FF3bc0d5E612190F45264D";
  const usdcAddress = process.env.SEPOLIA_USDC_TOKEN;
  const accountingAddress = process.env.SEPOLIA_ACCOUNTING;

  console.log("🔍 Checking Allowance & Balance");
  console.log("User:", userAddress);
  console.log("USDC:", usdcAddress);
  console.log("Spender (Accounting):", accountingAddress);

  const USDC = await ethers.getContractAt("IERC20", usdcAddress);

  const balance = await USDC.balanceOf(userAddress);
  console.log(`\n💰 Balance: ${ethers.formatUnits(balance, 6)} USDC`);

  const allowance = await USDC.allowance(userAddress, accountingAddress);
  console.log(`🔓 Allowance: ${ethers.formatUnits(allowance, 6)} USDC`);
  console.log(`   Raw Allowance: ${allowance.toString()}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
