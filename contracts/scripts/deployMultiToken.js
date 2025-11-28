const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../backend/.env") });

/**
 * Multi-Token DCA Deployment Script
 * Supports: USDC, WETH, WBTC (extensible to SOL, etc.)
 *  
 * Usage:
 *   npx hardhat run scripts/deployMultiToken.js --network sepolia
 *   npx hardhat run scripts/deployMultiToken.js --network mainnet
 */

// Token configurations by network
const TOKEN_CONFIGS = {
  sepolia: {
    tokens: {
      USDC: { 
        decimals: 6, 
        isMock: true,
        address: process.env.SEPOLIA_USDC_TOKEN 
      },
      WETH: { 
        decimals: 18, 
        isMock: true,
        address: process.env.SEPOLIA_WETH_TOKEN
      },
      WBTC: { 
        decimals: 8, 
        isMock: true,
        address: process.env.SEPOLIA_WBTC_TOKEN
      }
    },
    oracles: {
      USDC: { 
        price: 100000000, 
        decimals: 8,
        address: process.env.SEPOLIA_USDC_ORACLE
      },      
      WETH: { 
        price: 200000000000, 
        decimals: 8,
        address: process.env.SEPOLIA_WETH_ORACLE
      },   
      WBTC: { 
        price: 5000000000000, 
        decimals: 8,
        address: process.env.SEPOLIA_WBTC_ORACLE
      }   
    }
  },
  mainnet: {
    tokens: {
      USDC: { 
        address: process.env.MAINNET_USDC_TOKEN || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        decimals: 6,
        isMock: false 
      },
      WETH: { 
        address: process.env.MAINNET_WETH_TOKEN || '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        decimals: 18,
        isMock: false 
      },
      WBTC: { 
        address: process.env.MAINNET_WBTC_TOKEN || '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        decimals: 8,
        isMock: false 
      }
    },
    oracles: {
      USDC: { address: process.env.MAINNET_USDC_ORACLE || '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6' },
      WETH: { address: process.env.MAINNET_WETH_ORACLE || '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419' },
      WBTC: { address: process.env.MAINNET_WBTC_ORACLE || '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c' }
    }
  }
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === 'unknown' ? 'hardhat' : network.name;
  
  console.log("\n🚀 Multi-Token DCA Deployment");
  console.log("================================");
  console.log("Network:", networkName);
  console.log("Deployer:", deployer.address);
  console.log("================================\n");

  const config = TOKEN_CONFIGS[networkName] || TOKEN_CONFIGS.sepolia;
  const deployedAddresses = {};

  // Step 1: Deploy TokenRegistry (or use existing)
  let registryAddress = process.env[`${networkName.toUpperCase()}_REGISTRY`];
  let registry;

  if (registryAddress) {
    console.log("📋 Using existing TokenRegistry at:", registryAddress);
    registry = await ethers.getContractAt("TokenRegistry", registryAddress);
  } else {
    console.log("📋 Deploying TokenRegistry...");
    const TokenRegistry = await ethers.getContractFactory("TokenRegistry");
    registry = await TokenRegistry.deploy();
    await registry.waitForDeployment();
    registryAddress = await registry.getAddress();
    console.log("✅ TokenRegistry deployed at:", registryAddress);
  }
  deployedAddresses.REGISTRY = registryAddress;

  // Step 2: Deploy or use existing tokens
  const tokens = {};
  const oracles = {};
  
  for (const [symbol, tokenConfig] of Object.entries(config.tokens)) {
    // Check if address already exists in config (from .env)
    if (tokenConfig.address) {
      console.log(`\n📍 Using existing ${symbol}:`, tokenConfig.address);
      tokens[symbol] = tokenConfig.address;
      
      // Check for existing oracle
      if (config.oracles[symbol].address) {
        console.log(`   Using existing ${symbol} Oracle:`, config.oracles[symbol].address);
        oracles[symbol] = config.oracles[symbol].address;
      } else if (tokenConfig.isMock) {
         // Deploy mock oracle if not found
         console.log(`   Deploying Mock Oracle for ${symbol}...`);
         const oracleConfig = config.oracles[symbol];
         const MockOracle = await ethers.getContractFactory("MockOracle");
         const oracle = await MockOracle.deploy(oracleConfig.price, oracleConfig.decimals);
         await oracle.waitForDeployment();
         oracles[symbol] = await oracle.getAddress();
         console.log(`   ✅ ${symbol} Oracle deployed:`, oracles[symbol]);
      }
    } else if (tokenConfig.isMock) {
      // Deploy mock token
      console.log(`\n🪙  Deploying Mock ${symbol}...`);
      
      let TokenContract;
      if (symbol === 'WETH') {
        TokenContract = await ethers.getContractFactory("MockWETH");
      } else if (symbol === 'USDC') {
        TokenContract = await ethers.getContractFactory("MockUSDC");
      } else if (symbol === 'WBTC') {
        TokenContract = await ethers.getContractFactory("MockWBTC");
      } else {
        TokenContract = await ethers.getContractFactory("MockERC20");
      }
      
      const token = symbol === 'WETH' || symbol === 'USDC' || symbol === 'WBTC'
        ? await TokenContract.deploy()
        : await TokenContract.deploy(`Mock ${symbol}`, symbol, tokenConfig.decimals);
      
      await token.waitForDeployment();
      tokens[symbol] = await token.getAddress();
      console.log(`   ✅ ${symbol} deployed:`, tokens[symbol]);
      
      // Deploy mock oracle
      const oracleConfig = config.oracles[symbol];
      const MockOracle = await ethers.getContractFactory("MockOracle");
      const oracle = await MockOracle.deploy(
        oracleConfig.price,
        oracleConfig.decimals
      );
      await oracle.waitForDeployment();
      oracles[symbol] = await oracle.getAddress();
      console.log(`   ✅ ${symbol} Oracle deployed:`, oracles[symbol]);
    } else {
      // Mainnet fallback (should have address in config)
      console.warn(`⚠️  No address found for ${symbol} in mainnet config!`);
    }
    
    deployedAddresses[`${symbol}_TOKEN`] = tokens[symbol];
    deployedAddresses[`${symbol}_ORACLE`] = oracles[symbol];
  }

  // Step 3: Deploy vaults for each token
  console.log("\n🏦 Deploying Vaults...");
  const vaults = {};
  
  for (const [symbol, tokenAddress] of Object.entries(tokens)) {
    // Check if vault exists in env
    const existingVault = process.env[`${networkName.toUpperCase()}_${symbol}_VAULT`];
    
    if (existingVault) {
      console.log(`   Using existing ${symbol} Vault:`, existingVault);
      vaults[symbol] = existingVault;
    } else {
      const GenericVault = await ethers.getContractFactory("GenericVault");
      const vault = await GenericVault.deploy(tokenAddress);
      await vault.waitForDeployment();
      vaults[symbol] = await vault.getAddress();
      console.log(`   ✅ ${symbol} Vault deployed:`, vaults[symbol]);
    }
    deployedAddresses[`${symbol}_VAULT`] = vaults[symbol];
  }

  // Step 4: Deploy DCAAccountingV2 (or use existing)
  let accountingAddress = process.env[`${networkName.toUpperCase()}_ACCOUNTING`];
  let accounting;

  if (accountingAddress) {
    console.log("\n📊 Using existing DCA Accounting V2 at:", accountingAddress);
    accounting = await ethers.getContractAt("DCAAccountingV2", accountingAddress);
  } else {
    console.log("\n📊 Deploying DCA Accounting V2...");
    const DCAAccountingV2 = await ethers.getContractFactory("DCAAccountingV2");
    accounting = await DCAAccountingV2.deploy(registryAddress);
    await accounting.waitForDeployment();
    accountingAddress = await accounting.getAddress();
    console.log("✅ DCA Accounting V2 deployed at:", accountingAddress);
  }
  deployedAddresses.ACCOUNTING = accountingAddress;

  // Step 5: Register tokens in TokenRegistry
  console.log("\n🔐 Registering tokens in TokenRegistry...");
  for (const [symbol, tokenAddress] of Object.entries(tokens)) {
    const decimals = config.tokens[symbol].decimals;
    
    try {
      // Check if already registered
      await registry.getTokenConfig(symbol);
      console.log(`   ✅ ${symbol} already registered`);
    } catch (error) {
      // If getTokenConfig reverts, it means not registered
      console.log(`   📝 Registering ${symbol}...`);
      await registry.registerToken(
        symbol,
        tokenAddress,
        oracles[symbol],
        vaults[symbol],
        decimals
      );
      console.log(`   ✅ ${symbol} registered`);
    }
  }

  // Step 6: Setup permissions
  console.log("\n🔑 Setting up permissions...");
  for (const [symbol, vaultAddress] of Object.entries(vaults)) {
    const vault = await ethers.getContractAt("GenericVault", vaultAddress);
    try {
        // We can't easily check allowance on GenericVault without reading state variable directly if not public getter
        // But setSpender is usually safe to call again.
        // However, let's just call it.
        await vault.setSpender(accountingAddress, true);
        console.log(`   ✅ ${symbol} Vault authorized DCAAccounting`);
    } catch (e) {
        console.log(`   ⚠️  Could not set spender for ${symbol} Vault: ${e.message}`);
    }
  }

  // Step 7: Update .env file
  console.log("\n🔄 Updating backend .env file...");
  const envPath = path.join(__dirname, "../../backend/.env");
  const networkPrefix = networkName.toUpperCase();
  
  try {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Update or add addresses
    for (const [key, value] of Object.entries(deployedAddresses)) {
      const envKey = `${networkPrefix}_${key}`;
      const regex = new RegExp(`^${envKey}=.*$`, "m");
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${envKey}=${value}`);
      } else {
        envContent += `\n${envKey}=${value}`;
      }
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ .env file updated successfully!");
  } catch (error) {
    console.warn("⚠️  Could not update .env file:", error.message);
  }

  // Step 8: Summary
  console.log("\n");
  console.log("=".repeat(60));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Deployed Addresses:\n");
  console.log("TokenRegistry:", registryAddress);
  console.log("DCA Accounting:", accountingAddress);
  console.log("\nTokens:");
  for (const [symbol, address] of Object.entries(tokens)) {
    console.log(`  ${symbol}:`, address);
  }
  console.log("\nOracles:");
  for (const [symbol, address] of Object.entries(oracles)) {
    console.log(`  ${symbol}:`, address);
  }
  console.log("\nVaults:");
  for (const [symbol, address] of Object.entries(vaults)) {
    console.log(`  ${symbol}:`, address);
  }
  console.log("\n" + "=".repeat(60));
  console.log("\n💾 Addresses saved to backend/.env");
  console.log("🎯 Ready to use! Restart backend: cd backend && yarn dev\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
