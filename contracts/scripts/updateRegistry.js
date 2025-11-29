const hre = require("hardhat");
const { ethers } = require("hardhat");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../backend/.env") });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔧 Updating Registry...");
  console.log("👤 Deployer:", deployer.address);

  const registryAddress = process.env.SEPOLIA_REGISTRY;
  if (!registryAddress) {
    console.error("❌ SEPOLIA_REGISTRY not found in .env");
    return;
  }

  const registry = await ethers.getContractAt("TokenRegistry", registryAddress);
  console.log("📍 Registry:", registryAddress);

  const owner = await registry.owner();
  console.log("👑 Registry Owner:", owner);
  
  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.error("❌ Deployer is NOT owner!");
      return;
  }

  const tokens = ["USDC", "WETH", "WBTC"];
  
  for (const symbol of tokens) {
    const tokenAddress = process.env[`SEPOLIA_${symbol}_TOKEN`];
    const oracleAddress = process.env[`SEPOLIA_${symbol}_ORACLE`];
    const vaultAddress = process.env[`SEPOLIA_${symbol}_VAULT`];

    if (!tokenAddress || !oracleAddress || !vaultAddress) {
      console.error(`❌ Missing .env config for ${symbol}`);
      continue;
    }

    console.log(`\n🔄 Updating ${symbol}...`);
    console.log(`   Vault: ${vaultAddress}`);
    
    try {
      const tx = await registry.updateToken(
        symbol,
        tokenAddress,
        oracleAddress,
        vaultAddress,
        { gasLimit: 500000 }
      );
      console.log(`   ⏳ Waiting for tx: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Updated!`);
    } catch (e) {
      console.error(`   ❌ Error updating ${symbol}:`, e.message);
    }
  }

  console.log("\n✅ Registry updated!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
