const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("🚀 Deploying with:", deployer.address);

  const FeeModel = await hre.ethers.getContractFactory("FlatFeeModel");
  const feeModel = await FeeModel.deploy();
  await feeModel.waitForDeployment();

  const DCAPlanManager = await hre.ethers.getContractFactory("DCAPlanManager");
  const dca = await DCAPlanManager.deploy(
    deployer.address,
    "0x111111125421ca6dc452d289314280a0f8842a65" // 1inch router Polygon
  );
  await dca.waitForDeployment();

  await dca.setFeeModel(await feeModel.getAddress());

  console.log("✅ DCAPlanManager deployed to:", await dca.getAddress());
  console.log("✅ FeeModel deployed to:", await feeModel.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
