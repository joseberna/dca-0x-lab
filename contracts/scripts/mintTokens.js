const hre = require("hardhat");
require('dotenv').config({ path: '../backend/.env' });

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`\n👤 Deployer: ${deployer.address}`);

  // Read addresses from .env
  const USDC_ADDRESS = process.env.SM_USDC_SEPOLIA;
  const WBTC_ADDRESS = process.env.SM_WBTC_SEPOLIA;
  const TREASURY_ADDRESS = process.env.SM_TREASURYVAULT_SEPOLIA;

  console.log(`\n📋 Using addresses from .env:`);
  console.log(`   USDC: ${USDC_ADDRESS}`);
  console.log(`   WBTC: ${WBTC_ADDRESS}`);
  console.log(`   Treasury: ${TREASURY_ADDRESS}`);

  const usdc = await hre.ethers.getContractAt("MockUSDC", USDC_ADDRESS);
  const wbtc = await hre.ethers.getContractAt("MockWBTC", WBTC_ADDRESS);

  // 1. Mint USDC to Admin
  console.log("\n💵 Minteando 500 USDC a admin...");
  const tx1 = await usdc.mint(deployer.address, "500000000"); // 500 * 10^6
  await tx1.wait();
  console.log("✅ USDC minteado");

  // 2. Mint WBTC to Treasury
  console.log("\n🪙 Minteando 100 WBTC a Treasury...");
  const tx2 = await wbtc.mint(TREASURY_ADDRESS, "10000000000"); // 100 * 10^8
  await tx2.wait();
  console.log("✅ WBTC minteado");

  // Final Report
  const usdcBal = await usdc.balanceOf(deployer.address);
  const wbtcBal = await wbtc.balanceOf(TREASURY_ADDRESS);
  
  console.log("\n===========================================");
  console.log(`✅ Admin USDC: ${hre.ethers.formatUnits(usdcBal, 6)} USDC`);
  console.log(`✅ Treasury WBTC: ${hre.ethers.formatUnits(wbtcBal, 8)} WBTC`);
  console.log("===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
