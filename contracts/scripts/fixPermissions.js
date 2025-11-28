const hre = require("hardhat");
const { ethers } = require("hardhat");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../backend/.env") });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🔧 Fixing Permissions...");
  console.log("👤 Deployer:", deployer.address);

  const accountingAddress = process.env.SEPOLIA_ACCOUNTING;
  const usdcVaultAddress = process.env.SEPOLIA_USDC_VAULT;
  const wethVaultAddress = process.env.SEPOLIA_WETH_VAULT;
  const wbtcVaultAddress = process.env.SEPOLIA_WBTC_VAULT;

  if (!accountingAddress || !usdcVaultAddress || !wethVaultAddress || !wbtcVaultAddress) {
    console.error("❌ Missing addresses in .env");
    return;
  }

  console.log("📍 Accounting:", accountingAddress);
  
  const vaults = [
    { name: "USDC Vault", address: usdcVaultAddress },
    { name: "WETH Vault", address: wethVaultAddress },
    { name: "WBTC Vault", address: wbtcVaultAddress }
  ];

  for (const v of vaults) {
    console.log(`\n🔐 Checking ${v.name} at ${v.address}...`);
    const vault = await ethers.getContractAt("GenericVault", v.address);
    
    const isAuthorized = await vault.authorizedSpenders(accountingAddress);
    console.log(`   Authorized? ${isAuthorized}`);

    if (!isAuthorized) {
      console.log(`   📝 Authorizing...`);
      const tx = await vault.setSpender(accountingAddress, true);
      console.log(`   ⏳ Waiting for tx: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Authorized!`);
    } else {
      console.log(`   ✅ Already authorized.`);
    }
  }

  console.log("\n✅ All permissions fixed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
