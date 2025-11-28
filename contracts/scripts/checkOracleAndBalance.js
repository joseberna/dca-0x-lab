const hre = require("hardhat");
require('dotenv').config({ path: '../backend/.env' });

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`\n👤 Checking address: ${deployer.address}`);

  // Read addresses from .env
  const USDC_ADDRESS = process.env.SM_USDC_SEPOLIA;
  const WBTC_ADDRESS = process.env.SM_WBTC_SEPOLIA;
  const ORACLE_WBTC_ADDRESS = process.env.SM_ORACLE_WBTC_SEPOLIA;

  console.log("\n--- 🔍 ORACLE CHECK ---");
  const oracle = await hre.ethers.getContractAt("MockOracle", ORACLE_WBTC_ADDRESS);
  const roundData = await oracle.latestRoundData();
  const price = roundData[1];
  const decimals = await oracle.decimals();
  console.log(`WBTC Oracle Price: ${price.toString()}`);
  console.log(`Oracle Decimals: ${decimals}`);
  console.log(`Formatted Price: $${hre.ethers.formatUnits(price, decimals)}`);

  console.log("\n--- 🪙 WBTC BALANCE CHECK ---");
  const wbtc = await hre.ethers.getContractAt("MockWBTC", WBTC_ADDRESS);
  const wbtcDecimals = await wbtc.decimals();
  const wbtcBal = await wbtc.balanceOf(deployer.address);
  console.log(`WBTC Decimals: ${wbtcDecimals}`);
  console.log(`Raw Balance: ${wbtcBal.toString()}`);
  console.log(`Formatted Balance: ${hre.ethers.formatUnits(wbtcBal, wbtcDecimals)} WBTC`);

  console.log("\n--- 💵 USDC BALANCE CHECK ---");
  const usdc = await hre.ethers.getContractAt("MockUSDC", USDC_ADDRESS);
  const usdcDecimals = await usdc.decimals();
  const usdcBal = await usdc.balanceOf(deployer.address);
  const symbol = await usdc.symbol();
  console.log(`USDC Symbol: ${symbol}`);
  console.log(`USDC Decimals: ${usdcDecimals}`);
  console.log(`Raw Balance: ${usdcBal.toString()}`);
  console.log(`Formatted Balance: ${hre.ethers.formatUnits(usdcBal, usdcDecimals)} USDC`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
