const { ethers } = require("hardhat");
require("dotenv").config({ path: "../backend/.env" });

async function main() {
  const registryAddress = process.env.SEPOLIA_REGISTRY;
  if (!registryAddress) {
    console.error("❌ SEPOLIA_REGISTRY not found in .env");
    return;
  }

  console.log("🔍 Verifying TokenRegistry at:", registryAddress);
  const registry = await ethers.getContractAt("TokenRegistry", registryAddress);

  const usdcSymbol = "USDC";
  console.log(`\nChecking ${usdcSymbol}...`);
  
  try {
    const config = await registry.getTokenConfig(usdcSymbol);
    console.log("✅ Registered Address:", config.tokenAddress);
    console.log("   Expected Address:", process.env.SEPOLIA_USDC_TOKEN);
    
    if (config.tokenAddress.toLowerCase() === process.env.SEPOLIA_USDC_TOKEN.toLowerCase()) {
        console.log("   ✅ MATCH!");
    } else {
        console.error("   ❌ MISMATCH! Registry has different address.");
    }

    const vault = config.vault;
    console.log("   Registered Vault:", vault);
    
    // Check Vault Permissions
    console.log("\n🔐 Checking Vault Permissions...");
    const Vault = await ethers.getContractAt("GenericVault", vault);
    const accountingAddress = process.env.SEPOLIA_ACCOUNTING;
    console.log("   Accounting Address:", accountingAddress);
    
    // GenericVault might not have a public 'isSpender' or similar, checking allowance directly if possible
    // or just re-setting it to be sure.
    // Actually GenericVault has `allowedSpenders(address) public view returns (bool)`?
    // Let's check the contract source or just try to set it again.
    
    // Checking if we can read allowedSpenders
    try {
        const isSpender = await Vault.allowedSpenders(accountingAddress);
        console.log(`   Is Accounting Spender? ${isSpender}`);
    } catch (e) {
        console.log("   (Cannot read allowedSpenders directly)");
    }

  } catch (e) {
    console.error("❌ Error getting config:", e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
