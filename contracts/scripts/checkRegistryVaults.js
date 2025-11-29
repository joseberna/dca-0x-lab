const hre = require("hardhat");
const { ethers } = require("hardhat");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../backend/.env") });

async function main() {
  const registryAddress = process.env.SEPOLIA_REGISTRY;
  if (!registryAddress) {
    console.error("❌ SEPOLIA_REGISTRY not found in .env");
    return;
  }

  console.log("📋 Checking Registry at:", registryAddress);
  const registry = await ethers.getContractAt("TokenRegistry", registryAddress);

  const tokens = ["USDC", "WETH", "WBTC"];
  
  for (const symbol of tokens) {
    try {
      const config = await registry.getTokenConfig(symbol);
      console.log(`\n🪙  ${symbol}:`);
      console.log(`   Vault in Registry: ${config.vault}`);
      
      const envVault = process.env[`SEPOLIA_${symbol}_VAULT`];
      console.log(`   Vault in .env:     ${envVault}`);
      
      if (config.vault.toLowerCase() !== envVault.toLowerCase()) {
        console.error(`   ❌ MISMATCH! Registry has old vault.`);
      } else {
        console.log(`   ✅ Match.`);
      }

      // Check permissions on the Registry's vault
      const vault = await ethers.getContractAt("GenericVault", config.vault);
      const accountingAddress = process.env.SEPOLIA_ACCOUNTING;
      const isAuthorized = await vault.authorizedSpenders(accountingAddress);
      console.log(`   Authorized for Accounting (${accountingAddress})? ${isAuthorized}`);

    } catch (e) {
      console.error(`   ❌ Error checking ${symbol}:`, e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
