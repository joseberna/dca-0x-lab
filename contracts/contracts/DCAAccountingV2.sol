// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./TokenRegistry.sol";
import "./GenericVault.sol";
import "./interfaces/AggregatorV3Interface.sol";

/**
 * @title DCAAccountingV2
 * @notice Multi-token DCA system using TokenRegistry for dynamic configuration
 * @dev Supports any token registered in TokenRegistry (WETH, WBTC, SOL, etc.)
 */
contract DCAAccountingV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct Plan {
        address user;
        string fromToken;       // Always "USDC" for now
        string toToken;         // "WETH", "WBTC", "SOL", etc.
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
    TokenRegistry public immutable registry;
    
    // Events
    event PlanCreated(
        uint256 indexed planId,
        address indexed user,
        string toToken,
        uint256 totalBudget
    );
    
    event TickExecuted(
        uint256 indexed planId,
        string toToken,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 price
    );
    
    event PlanCompleted(uint256 indexed planId);
    event PlanCancelled(uint256 indexed planId, uint256 remainingBudget);

    constructor(address _registry) {
        require(_registry != address(0), "Invalid registry");
        registry = TokenRegistry(_registry);
    }

    /**
     * @notice Create a new DCA plan
     * @param toToken Symbol of target token (e.g., "WETH", "WBTC")
     * @param totalBudget Total USDC to spend
     * @param amountPerTick USDC amount per tick
     * @param interval Seconds between ticks
     * @param totalTicks Total number of ticks
     */
    function createPlan(
        string calldata toToken,
        uint256 totalBudget,
        uint256 amountPerTick,
        uint256 interval,
        uint256 totalTicks
    ) external nonReentrant returns (uint256) {
        require(bytes(toToken).length > 0, "Empty token symbol");
        require(totalBudget > 0, "Budget must be > 0");
        require(amountPerTick > 0, "Amount per tick must be > 0");
        require(totalTicks > 0, "Total ticks must be > 0");
        require(interval > 0, "Interval must be > 0");
        require(totalBudget >= amountPerTick * totalTicks, "Budget mismatch");
        
        // Validate target token is registered and active
        require(registry.isTokenActive(toToken), "Token not active");
        
        // Get USDC vault
        TokenRegistry.TokenConfig memory usdcConfig = registry.getTokenConfig("USDC");
        GenericVault usdcVault = GenericVault(usdcConfig.vault);
        
        // Transfer USDC from user to this contract first
        IERC20 usdc = IERC20(usdcConfig.tokenAddress);
        usdc.safeTransferFrom(msg.sender, address(this), totalBudget);
        
        // Approve vault to spend USDC from this contract
        usdc.safeIncreaseAllowance(address(usdcVault), totalBudget);
        
        // Deposit into vault on behalf of user
        // depositFor transfers from msg.sender (this contract) to vault
        usdcVault.depositFor(msg.sender, totalBudget);
        
        // Create plan
        uint256 planId = nextPlanId++;
        plans[planId] = Plan({
            user: msg.sender,
            fromToken: "USDC",
            toToken: toToken,
            totalBudget: totalBudget,
            amountPerTick: amountPerTick,
            totalTicks: totalTicks,
            executedTicks: 0,
            interval: interval,
            lastExecution: block.timestamp,
            active: true
        });
        
        emit PlanCreated(planId, msg.sender, toToken, totalBudget);
        return planId;
    }

    /**
     * @notice Execute one tick of a DCA plan
     * @param planId ID of the plan to execute
     */
    function executeTick(uint256 planId) external nonReentrant {
        Plan storage plan = plans[planId];
        
        require(plan.active, "Plan inactive");
        require(plan.executedTicks < plan.totalTicks, "Plan completed");
        
        // Get token configurations
        TokenRegistry.TokenConfig memory fromConfig = registry.getTokenConfig(plan.fromToken);
        TokenRegistry.TokenConfig memory toConfig = registry.getTokenConfig(plan.toToken);
        
        // Get prices from oracles
        uint256 fromPrice = getPrice(AggregatorV3Interface(fromConfig.oracle));
        uint256 toPrice = getPrice(AggregatorV3Interface(toConfig.oracle));
        
        // Calculate amount of target token to receive
        // Formula: (fromAmount * fromPrice * toDecimals) / (fromDecimals * toPrice)
        uint256 fromAmount = plan.amountPerTick;
        uint256 toAmount = calculateSwapAmount(
            fromAmount,
            fromPrice,
            toPrice,
            fromConfig.decimals,
            toConfig.decimals
        );
        
        require(toAmount > 0, "Calculated amount is 0");
        
        // Execute swap
        GenericVault fromVault = GenericVault(fromConfig.vault);
        GenericVault toVault = GenericVault(toConfig.vault);
        
        // Spend USDC from user's vault
        fromVault.spend(plan.user, fromAmount);
        
        // Transfer target token to user
        // Use withdrawInventory to pull tokens from vault (requires authorization)
        toVault.withdrawInventory(plan.user, toAmount);
        
        // Update plan state
        plan.executedTicks++;
        plan.lastExecution = block.timestamp;
        
        emit TickExecuted(planId, plan.toToken, fromAmount, toAmount, toPrice);
        
        // Complete plan if all ticks executed
        if (plan.executedTicks >= plan.totalTicks) {
            plan.active = false;
            emit PlanCompleted(planId);
        }
    }

    /**
     * @notice Calculate swap amount with proper decimal handling
     * @param fromAmount Amount of source token
     * @param fromPrice Price of source token (8 decimals)
     * @param toPrice Price of target token (8 decimals)
     * @param fromDecimals Decimals of source token
     * @param toDecimals Decimals of target token
     * @return uint256 Amount of target token
     */
    function calculateSwapAmount(
        uint256 fromAmount,
        uint256 fromPrice,
        uint256 toPrice,
        uint8 fromDecimals,
        uint8 toDecimals
    ) internal pure returns (uint256) {
        // Formula: (fromAmount * fromPrice * 10^toDecimals) / (10^fromDecimals * toPrice)
        uint256 numerator = fromAmount * fromPrice * (10 ** toDecimals);
        uint256 denominator = (10 ** fromDecimals) * toPrice;
        return numerator / denominator;
    }

    /**
     * @notice Get latest price from Chainlink oracle
     * @param oracle Chainlink price feed
     * @return uint256 Latest price (8 decimals)
     */
    function getPrice(AggregatorV3Interface oracle) internal view returns (uint256) {
        (, int256 price, , , ) = oracle.latestRoundData();
        require(price > 0, "Invalid price");
        return uint256(price);
    }

    /**
     * @notice Cancel a plan and return remaining funds
     * @param planId ID of the plan to cancel
     */
    function cancelPlan(uint256 planId) external nonReentrant {
        Plan storage plan = plans[planId];
        
        require(plan.user == msg.sender, "Not plan owner");
        require(plan.active, "Plan not active");
        
        uint256 remainingTicks = plan.totalTicks - plan.executedTicks;
        uint256 remainingBudget = remainingTicks * plan.amountPerTick;
        
        if (remainingBudget > 0) {
            TokenRegistry.TokenConfig memory usdcConfig = registry.getTokenConfig("USDC");
            GenericVault usdcVault = GenericVault(usdcConfig.vault);
            
            // Transfer remaining USDC back to user
            usdcVault.transferTo(msg.sender, msg.sender, remainingBudget);
        }
        
        plan.active = false;
        emit PlanCancelled(planId, remainingBudget);
    }

    /**
     * @notice Get plan details
     * @param planId ID of the plan
     * @return Plan struct
     */
    function getPlan(uint256 planId) external view returns (Plan memory) {
        return plans[planId];
    }

    /**
     * @notice Check if a plan is active
     * @param planId ID of the plan
     * @return bool True if active
     */
    function isPlanActive(uint256 planId) external view returns (bool) {
        return plans[planId].active;
    }
}
