const { ethers } = require("hardhat");
require("dotenv").config({ path: "../backend/.env" });

async function main() {
  const [deployer] = await ethers.getSigners();
  // El usuario que reportó el error
  const targetUser = "0x0C1ee65e59Cd82C1C6FF3bc0d5E612190F45264D"; 

  console.log("\n🪙  Minting New Tokens for User");
  console.log("================================");
  console.log("Target User:", targetUser);
  console.log("Network:", network.name);

  // Leer direcciones del .env (que fue actualizado por el deploy anterior)
  const usdcAddress = process.env.SEPOLIA_USDC_TOKEN;
  const wethAddress = process.env.SEPOLIA_WETH_TOKEN;
  const wbtcAddress = process.env.SEPOLIA_WBTC_TOKEN;

  if (!usdcAddress) {
    console.error("❌ Error: SEPOLIA_USDC_TOKEN not found in .env");
    return;
  }

  // 1. Mint USDC
  console.log(`\n💵 Minting USDC at ${usdcAddress}...`);
  const USDC = await ethers.getContractAt("MockUSDC", usdcAddress);
  const amountUSDC = ethers.parseUnits("10000", 6); // 10,000 USDC
  try {
    const tx = await USDC.mint(targetUser, amountUSDC);
    console.log(`   ✅ Minted 10,000 USDC. Hash: ${tx.hash}`);
    await tx.wait();
  } catch (e) {
    console.error("   ❌ Failed to mint USDC:", e.message);
  }

  // 2. Mint WETH
  if (wethAddress) {
    console.log(`\nΞ  Minting WETH at ${wethAddress}...`);
    const WETH = await ethers.getContractAt("MockWETH", wethAddress);
    const amountWETH = ethers.parseUnits("10", 18); // 10 WETH
    try {
      const tx = await WETH.mint(targetUser, amountWETH);
      console.log(`   ✅ Minted 10 WETH. Hash: ${tx.hash}`);
      await tx.wait();
    } catch (e) {
      console.error("   ❌ Failed to mint WETH:", e.message);
    }
  }

  // 3. Mint WBTC
  if (wbtcAddress) {
    console.log(`\n₿  Minting WBTC at ${wbtcAddress}...`);
    const WBTC = await ethers.getContractAt("MockWBTC", wbtcAddress);
    const amountWBTC = ethers.parseUnits("1", 8); // 1 WBTC
    try {
      const tx = await WBTC.mint(targetUser, amountWBTC);
      console.log(`   ✅ Minted 1 WBTC. Hash: ${tx.hash}`);
      await tx.wait();
    } catch (e) {
      console.error("   ❌ Failed to mint WBTC:", e.message);
    }
  }

  console.log("\n✅ Done! User should now have balance.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
