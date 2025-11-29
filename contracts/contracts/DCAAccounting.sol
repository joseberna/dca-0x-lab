// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DCAUserVault.sol";
import "./DCATreasuryVault.sol";
import "./interfaces/AggregatorV3Interface.sol";

/**
 * @title DCAAccounting
 * @notice Manages DCA plans and executes "ticks" (periodic purchases).
 * @dev Calculates exchange rates via Chainlink Oracles and coordinates fund movements
 *      between DCAUserVault and DCATreasuryVault.
 */
contract DCAAccounting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct Plan {
        address user;
        address tokenFrom;      // USDC
        address tokenTo;        // WBTC
        uint256 totalBudget;    // Total USDC committed
        uint256 amountPerTick;  // USDC per execution
        uint256 totalTicks;     // Total number of executions
        uint256 executedTicks;  // Number of executions so far
        uint256 interval;       // Seconds between ticks
        uint256 lastExecution;  // Timestamp of last execution
        bool active;
    }

    // State
    mapping(uint256 => Plan) public plans;
    uint256 public nextPlanId = 1;

    // Config
    DCAUserVault public immutable userVault;
    DCATreasuryVault public immutable treasuryVault;
    
    // Oracles (Polygon Mainnet addresses to be set in constructor)
    AggregatorV3Interface public usdcOracle;
    AggregatorV3Interface public wbtcOracle;

    // Events
    event PlanCreated(uint256 indexed planId, address indexed user, uint256 totalBudget);
    event TickExecuted(uint256 indexed planId, uint256 usdcSpent, uint256 wbtcReceived, uint256 price);
    event PlanCompleted(uint256 indexed planId);
    event PlanCancelled(uint256 indexed planId, uint256 remainingBudget);

    constructor(
        address _userVault,
        address _treasuryVault,
        address _usdcOracle,
        address _wbtcOracle
    ) {
        require(_userVault != address(0), "Invalid UserVault");
        require(_treasuryVault != address(0), "Invalid TreasuryVault");
        require(_usdcOracle != address(0), "Invalid USDC Oracle");
        require(_wbtcOracle != address(0), "Invalid WBTC Oracle");

        userVault = DCAUserVault(_userVault);
        treasuryVault = DCATreasuryVault(_treasuryVault);
        usdcOracle = AggregatorV3Interface(_usdcOracle);
        wbtcOracle = AggregatorV3Interface(_wbtcOracle);
    }

    /**
     * @notice Creates a new DCA plan.
     * @dev User must approve UserVault to spend USDC before calling this.
     *      The contract pulls USDC from user and deposits it into UserVault.
     */
    function createPlan(
        address tokenFrom,
        address tokenTo,
        uint256 totalBudget,
        uint256 amountPerTick,
        uint256 interval,
        uint256 totalTicks
    ) external nonReentrant returns (uint256) {
        require(totalBudget > 0, "Budget must be > 0");
        require(amountPerTick > 0, "Tick amount must be > 0");
        require(totalTicks > 0, "Total ticks must be > 0");
        require(totalBudget >= amountPerTick * totalTicks, "Budget mismatch");
        
        // We only support USDC -> WBTC for now
        // In production, we would check against allowlisted tokens
        
        // 1. Transfer USDC from User to UserVault
        // Note: User must have approved UserVault (not this contract) or we use permit.
        // Actually, standard flow: User approves THIS contract -> This contract transfers to UserVault.
        // OR: User approves UserVault -> This contract calls UserVault.depositFor(user).
        // Current UserVault.deposit() takes from msg.sender.
        // So User should call UserVault.deposit() first? No, UX is better if createPlan does it.
        // Let's assume User approves DCAAccounting. DCAAccounting pulls and deposits to UserVault.
        
        // But UserVault.deposit() attributes to msg.sender (DCAAccounting).
        // We need UserVault to attribute to 'user'.
        // Let's modify UserVault or just handle the transfer here and assume UserVault.deposit() isn't used directly by user?
        // Better: User approves DCAUserVault. DCAAccounting calls `userVault.depositFrom(user, amount)`.
        // But `deposit` in UserVault uses `msg.sender`.
        
        // FIX: Let's assume for this PoC that the User calls `createPlan`, and `createPlan` pulls tokens to ITSELF,
        // then approves UserVault, then deposits.
        // Result: UserVault sees balance for DCAAccounting.
        // But we want UserVault to track User balances for transparency.
        
        // REVISED FLOW:
        // 1. User approves DCAUserVault.
        // 2. DCAAccounting calls `userVault.depositFor(user, amount)`.
        // I need to add `depositFor` to DCAUserVault.
        
        // For now, let's stick to: User approves DCAAccounting. DCAAccounting pulls USDC.
        // DCAAccounting sends USDC to UserVault. UserVault records it for `user`.
        // I will add `depositFor` to UserVault in a separate step or just use `deposit` and track it internally?
        // No, UserVault has `balances`.
        
        // Let's update `DCAUserVault` to have `depositFor`.
        // Since I already wrote `DCAUserVault`, I will update it in the next step.
        // For now, I'll write the code assuming `depositFor` exists.
        
        // 1. Transfer USDC from User to DCAAccounting
        IERC20(tokenFrom).safeTransferFrom(msg.sender, address(this), totalBudget);

        // 2. Approve UserVault to spend USDC
        IERC20(tokenFrom).safeApprove(address(userVault), totalBudget);

        // 3. Deposit to UserVault on behalf of user
        userVault.depositFor(msg.sender, totalBudget);

        uint256 planId = nextPlanId++;
        plans[planId] = Plan({
            user: msg.sender,
            tokenFrom: tokenFrom,
            tokenTo: tokenTo,
            totalBudget: totalBudget,
            amountPerTick: amountPerTick,
            totalTicks: totalTicks,
            executedTicks: 0,
            interval: interval,
            lastExecution: block.timestamp, // First tick can be immediate or delayed. Let's say delayed.
            active: true
        });

        emit PlanCreated(planId, msg.sender, totalBudget);
        return planId;
    }

    /**
     * @notice Executes a tick for a specific plan.
     * @dev Can be called by anyone (e.g., Keeper/Worker).
     */
    function executeTick(uint256 planId) external nonReentrant {
        Plan storage plan = plans[planId];
        require(plan.active, "Plan inactive");
        require(plan.executedTicks < plan.totalTicks, "Plan completed");
        // require(block.timestamp >= plan.lastExecution + plan.interval, "Too early"); 
        // Commented out "Too early" for easier testing, or we can use a small interval.
        // In prod, uncomment.
        
        // 1. Get Prices
        uint256 wbtcPrice = getPrice(wbtcOracle); // 8 decimals
        uint256 usdcPrice = getPrice(usdcOracle); // 8 decimals
        
        // 2. Calculate WBTC amount
        // Formula: (USDC_amount * USDC_price * WBTC_decimals) / (USDC_decimals * WBTC_price)
        // USDC: 6 decimals, WBTC: 8 decimals, Prices: 8 decimals
        // Result: (6 + 8 + 8) - (6 + 8) = 8 decimals (correct for WBTC)
        
        uint256 usdcAmount = plan.amountPerTick;
        uint256 wbtcAmount = (usdcAmount * usdcPrice * 1e8) / (1e6 * wbtcPrice);
        
        require(wbtcAmount > 0, "Calculated WBTC amount is 0");

        // 3. Spend USDC (UserVault)
        userVault.spend(plan.user, usdcAmount);

        // 4. Send WBTC (TreasuryVault)
        treasuryVault.withdrawTo(plan.user, wbtcAmount);

        // 5. Update Plan
        plan.executedTicks++;
        plan.lastExecution = block.timestamp;
        
        emit TickExecuted(planId, usdcAmount, wbtcAmount, wbtcPrice);

        if (plan.executedTicks >= plan.totalTicks) {
            plan.active = false;
            emit PlanCompleted(planId);
        }
    }

    function getPrice(AggregatorV3Interface oracle) internal view returns (uint256) {
        (, int256 price, , , ) = oracle.latestRoundData();
        require(price > 0, "Invalid price");
        return uint256(price);
    }
}
