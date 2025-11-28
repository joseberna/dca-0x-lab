const { ethers } = require("hardhat");
require("dotenv").config({ path: "../backend/.env" });

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Debugger running as:", deployer.address);

  const accountingAddress = process.env.SEPOLIA_ACCOUNTING;
  const usdcAddress = process.env.SEPOLIA_USDC_TOKEN;
  
  console.log("Accounting Env:", process.env.SEPOLIA_ACCOUNTING);
  console.log("USDC:", usdcAddress);

  if (!accountingAddress) {
      console.error("❌ SEPOLIA_ACCOUNTING not found in .env");
      return;
  }

  const Accounting = await ethers.getContractAt("DCAAccountingV2", accountingAddress);
  const USDC = await ethers.getContractAt("IERC20", usdcAddress);

  // Parameters matching user request
  const toToken = "WETH";
  const totalBudget = 30000000; // 30 USDC
  const amountPerTick = 10000000; // 10 USDC
  const interval = 60;
  const totalTicks = 3;

  // 1. Check Balance
  const balance = await USDC.balanceOf(deployer.address);
  console.log(`Balance: ${ethers.formatUnits(balance, 6)} USDC`);
  if (balance < totalBudget) {
    console.error("❌ Insufficient balance");
    return;
  }

  // 2. Approve
  console.log("Approving...");
  const txApprove = await USDC.approve(accountingAddress, totalBudget);
  await txApprove.wait();
  console.log("✅ Approved");

  // 3. Create Plan
  console.log("Creating Plan...");
  let planId;
  try {
    const tx = await Accounting.createPlan(
      toToken,
      totalBudget,
      amountPerTick,
      interval,
      totalTicks,
      { gasLimit: 500000 }
    );
    console.log("Tx sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Plan Created!");
    
    // Extract Plan ID from events
    const event = receipt.logs.find(log => {
        try {
            return Accounting.interface.parseLog(log)?.name === "PlanCreated";
        } catch (e) { return false; }
    });
    
    if (event) {
        const parsed = Accounting.interface.parseLog(event);
        planId = parsed.args.planId;
        console.log("🆔 Plan ID:", planId.toString());
    } else {
        console.error("❌ Could not find PlanCreated event");
        return;
    }

  } catch (error) {
    console.error("❌ Create Plan Failed:", error.message);
    return;
  }

  // 4. Execute Tick
  console.log(`\n🚀 Executing Tick for Plan ${planId}...`);
  try {
      const txTick = await Accounting.executeTick(planId, { gasLimit: 500000 });
      console.log("Tx Tick sent:", txTick.hash);
      await txTick.wait();
      console.log("✅ Tick Executed Successfully!");
  } catch (error) {
      console.error("❌ Execute Tick Failed:");
      if (error.data) {
          try {
              const code = Accounting.interface.parseError(error.data);
              console.error("Decoded Error:", code);
          } catch (e) {
              console.log("Could not decode error");
          }
      } else {
          console.error(error.message);
      }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
