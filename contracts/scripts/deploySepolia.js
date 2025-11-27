const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy Mocks
  console.log("Deploying Mocks...");
  
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  console.log("MockUSDC deployed to:", await usdc.getAddress());

  const MockWBTC = await hre.ethers.getContractFactory("MockWBTC");
  const wbtc = await MockWBTC.deploy();
  await wbtc.waitForDeployment();
  console.log("MockWBTC deployed to:", await wbtc.getAddress());

  const MockOracle = await hre.ethers.getContractFactory("MockOracle");
  // USDC Price: $1.00 (8 decimals)
  const usdcOracle = await MockOracle.deploy(100000000, 8); 
  await usdcOracle.waitForDeployment();
  console.log("MockUSDC Oracle deployed to:", await usdcOracle.getAddress());

  // WBTC Price: $50,000.00 (8 decimals)
  // FIX: 50000 * 10^8 = 5,000,000,000,000 (5 Trillion)
  const wbtcOracle = await MockOracle.deploy("5000000000000", 8);
  await wbtcOracle.waitForDeployment();
  console.log("MockWBTC Oracle deployed to:", await wbtcOracle.getAddress());

  // 2. Deploy Vaults
  console.log("Deploying Vaults...");
  
  const DCAUserVault = await hre.ethers.getContractFactory("DCAUserVault");
  const userVault = await DCAUserVault.deploy(await usdc.getAddress());
  await userVault.waitForDeployment();
  console.log("DCAUserVault deployed to:", await userVault.getAddress());

  const DCATreasuryVault = await hre.ethers.getContractFactory("DCATreasuryVault");
  const treasuryVault = await DCATreasuryVault.deploy(await wbtc.getAddress());
  await treasuryVault.waitForDeployment();
  console.log("DCATreasuryVault deployed to:", await treasuryVault.getAddress());

  // 3. Deploy Accounting
  console.log("Deploying Accounting...");
  
  const DCAAccounting = await hre.ethers.getContractFactory("DCAAccounting");
  const accounting = await DCAAccounting.deploy(
    await userVault.getAddress(),
    await treasuryVault.getAddress(),
    await usdcOracle.getAddress(),
    await wbtcOracle.getAddress()
  );
  await accounting.waitForDeployment();
  console.log("DCAAccounting deployed to:", await accounting.getAddress());

  // 4. Setup Permissions
  console.log("Setting up permissions...");
  await userVault.setSpender(await accounting.getAddress(), true);
  await treasuryVault.setSpender(await accounting.getAddress(), true);

  // 5. Mint Initial Tokens
//   console.log("Minting initial tokens...");
//   // Mint 500 USDC to deployer (clean amount for testing)
//   await usdc.mint(deployer.address, 500000000); // 500 * 10^6
//   console.log("✅ Minted 500 USDC to deployer");
  
  // Mint 100 WBTC to Treasury (for DCA operations)
//   await wbtc.mint(await treasuryVault.getAddress(), 10000000000); // 100 * 10^8
//   console.log("✅ Minted 100 WBTC to Treasury");

  console.log("\n✅ Deployment Complete!");
  console.log("====================================================");
  console.log("USDC:", await usdc.getAddress());
  console.log("WBTC:", await wbtc.getAddress());
  console.log("UserVault:", await userVault.getAddress());
  console.log("TreasuryVault:", await treasuryVault.getAddress());
  console.log("Accounting:", await accounting.getAddress());
  console.log("USDC Oracle:", await usdcOracle.getAddress());
  console.log("WBTC Oracle:", await wbtcOracle.getAddress());
  console.log("====================================================");

  // Auto-update .env file
  console.log("\n🔄 Updating backend .env file...");
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '../../backend/.env');
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update addresses
    envContent = envContent.replace(/SM_USDC_SEPOLIA=.*/g, `SM_USDC_SEPOLIA=${await usdc.getAddress()}`);
    envContent = envContent.replace(/SM_WBTC_SEPOLIA=.*/g, `SM_WBTC_SEPOLIA=${await wbtc.getAddress()}`);
    envContent = envContent.replace(/SM_USERVAULT_SEPOLIA=.*/g, `SM_USERVAULT_SEPOLIA=${await userVault.getAddress()}`);
    envContent = envContent.replace(/SM_TREASURYVAULT_SEPOLIA=.*/g, `SM_TREASURYVAULT_SEPOLIA=${await treasuryVault.getAddress()}`);
    envContent = envContent.replace(/SM_ACCOUNTING_SEPOLIA=.*/g, `SM_ACCOUNTING_SEPOLIA=${await accounting.getAddress()}`);
    envContent = envContent.replace(/SM_ORACLE_USDC_SEPOLIA=.*/g, `SM_ORACLE_USDC_SEPOLIA=${await usdcOracle.getAddress()}`);
    envContent = envContent.replace(/SM_ORACLE_WBTC_SEPOLIA=.*/g, `SM_ORACLE_WBTC_SEPOLIA=${await wbtcOracle.getAddress()}`);
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file updated successfully!");
  } else {
    console.log("⚠️  .env file not found at:", envPath);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
