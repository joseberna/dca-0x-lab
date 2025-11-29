const { ethers } = require("hardhat");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../backend/.env") });

async function main() {
  const registryAddress = process.env.SEPOLIA_REGISTRY;
  
  if (!registryAddress) {
    console.error("❌ SEPOLIA_REGISTRY not found in .env");
    process.exit(1);
  }

  console.log("\n🔍 Checking TokenRegistry Configuration");
  console.log("=========================================");
  console.log("Registry:", registryAddress);
  console.log("=========================================\n");

  const registry = await ethers.getContractAt("TokenRegistry", registryAddress);

  const tokens = ["USDC", "WETH", "WBTC"];

  for (const symbol of tokens) {
    try {
      const config = await registry.getTokenConfig(symbol);
      console.log(`\n📋 ${symbol} Configuration:`);
      console.log(`   Token Address: ${config.tokenAddress}`);
      console.log(`   Oracle: ${config.oracle}`);
      console.log(`   Vault: ${config.vault}`);
      console.log(`   Decimals: ${config.decimals}`);
      console.log(`   Active: ${config.isActive}`);
    } catch (error) {
      console.log(`\n❌ ${symbol} not registered: ${error.message}`);
    }
  }

  console.log("\n=========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
