const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DedlyFi DCA Architecture", function () {
  let userVault, treasuryVault, accounting;
  let usdc, wbtc;
  let usdcOracle, wbtcOracle;
  let owner, user, bot;

  const USDC_DECIMALS = 6;
  const WBTC_DECIMALS = 8;
  const ORACLE_DECIMALS = 8;

  const INITIAL_USDC_PRICE = 100000000; // $1.00
  const INITIAL_WBTC_PRICE = 5000000000000; // $50,000.00

  beforeEach(async function () {
    [owner, user, bot] = await ethers.getSigners();

    // 1. Deploy Mocks
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();

    const MockWBTC = await ethers.getContractFactory("MockWBTC");
    wbtc = await MockWBTC.deploy();

    const MockOracle = await ethers.getContractFactory("MockOracle");
    usdcOracle = await MockOracle.deploy(INITIAL_USDC_PRICE, ORACLE_DECIMALS);
    wbtcOracle = await MockOracle.deploy(INITIAL_WBTC_PRICE, ORACLE_DECIMALS);

    // 2. Deploy Vaults
    const DCAUserVault = await ethers.getContractFactory("DCAUserVault");
    userVault = await DCAUserVault.deploy(await usdc.getAddress());

    const DCATreasuryVault = await ethers.getContractFactory("DCATreasuryVault");
    treasuryVault = await DCATreasuryVault.deploy(await wbtc.getAddress());

    // 3. Deploy Accounting
    const DCAAccounting = await ethers.getContractFactory("DCAAccounting");
    accounting = await DCAAccounting.deploy(
      await userVault.getAddress(),
      await treasuryVault.getAddress(),
      await usdcOracle.getAddress(),
      await wbtcOracle.getAddress()
    );

    // 4. Setup Permissions
    await userVault.setSpender(await accounting.getAddress(), true);
    await treasuryVault.setSpender(await accounting.getAddress(), true);

    // 5. Mint Tokens
    await usdc.mint(user.address, ethers.parseUnits("1000", USDC_DECIMALS));
    await wbtc.mint(owner.address, ethers.parseUnits("10", WBTC_DECIMALS));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await accounting.owner()).to.equal(owner.address);
    });

    it("Should have correct token addresses", async function () {
      expect(await userVault.usdcToken()).to.equal(await usdc.getAddress());
      expect(await treasuryVault.wbtcToken()).to.equal(await wbtc.getAddress());
    });
  });

  describe("Treasury Management", function () {
    it("Should allow depositing inventory", async function () {
      const amount = ethers.parseUnits("1", WBTC_DECIMALS);
      await wbtc.approve(await treasuryVault.getAddress(), amount);
      await treasuryVault.depositInventory(amount);

      expect(await wbtc.balanceOf(await treasuryVault.getAddress())).to.equal(amount);
    });
  });

  describe("DCA Flow", function () {
    const totalBudget = ethers.parseUnits("100", USDC_DECIMALS);
    const amountPerTick = ethers.parseUnits("5", USDC_DECIMALS);
    const totalTicks = 20;
    const interval = 86400; // 1 day

    beforeEach(async function () {
      // Fill Treasury
      const inventory = ethers.parseUnits("1", WBTC_DECIMALS);
      await wbtc.approve(await treasuryVault.getAddress(), inventory);
      await treasuryVault.depositInventory(inventory);
    });

    it("Should create a plan successfully", async function () {
      await usdc.connect(user).approve(await accounting.getAddress(), totalBudget);
      
      await expect(accounting.connect(user).createPlan(
        await usdc.getAddress(),
        await wbtc.getAddress(),
        totalBudget,
        amountPerTick,
        interval,
        totalTicks
      )).to.emit(accounting, "PlanCreated")
        .withArgs(1, user.address, totalBudget);

      const plan = await accounting.plans(1);
      expect(plan.user).to.equal(user.address);
      expect(plan.totalBudget).to.equal(totalBudget);
    });

    it("Should execute a tick successfully", async function () {
      // 1. Create Plan
      await usdc.connect(user).approve(await accounting.getAddress(), totalBudget);
      await accounting.connect(user).createPlan(
        await usdc.getAddress(),
        await wbtc.getAddress(),
        totalBudget,
        amountPerTick,
        interval,
        totalTicks
      );

      // 2. Execute Tick
      // Initial Balances
      const initialUserUSDC = await userVault.balances(user.address);
      const initialTreasuryWBTC = await wbtc.balanceOf(await treasuryVault.getAddress());
      const initialUserWBTC = await wbtc.balanceOf(user.address);

      await expect(accounting.executeTick(1))
        .to.emit(accounting, "TickExecuted");

      // 3. Verify Balances
      // UserVault should decrease by amountPerTick
      expect(await userVault.balances(user.address)).to.equal(initialUserUSDC - amountPerTick);

      // TreasuryVault should decrease by calculated WBTC amount
      // Price: 1 USDC = $1, 1 WBTC = $50,000
      // 5 USDC = 0.0001 WBTC = 10000 sats
      // Calculation: (5 * 10^6 * 10^8 * 10^8) / (10^6 * 50000 * 10^8) = 10000
      const expectedWBTC = 10000n; // 10000 sats
      
      expect(await wbtc.balanceOf(await treasuryVault.getAddress())).to.equal(initialTreasuryWBTC - expectedWBTC);
      expect(await wbtc.balanceOf(user.address)).to.equal(initialUserWBTC + expectedWBTC);

      // 4. Verify Plan State
      const plan = await accounting.plans(1);
      expect(plan.executedTicks).to.equal(1);
    });
  });
});
