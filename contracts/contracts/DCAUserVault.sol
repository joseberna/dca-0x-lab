// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DCAUserVault
 * @notice Holds user funds (USDC) for DCA execution.
 * @dev Users deposit USDC here. The DCAAccounting contract is authorized to spend funds
 *      on behalf of users when executing DCA ticks.
 */
contract DCAUserVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdcToken;

    // User balances
    mapping(address => uint256) public balances;

    // Authorized spenders (e.g., DCAAccounting contract)
    mapping(address => bool) public isSpender;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Spent(address indexed user, address indexed spender, uint256 amount);
    event SpenderUpdated(address indexed spender, bool active);

    modifier onlySpender() {
        require(isSpender[msg.sender], "DCAUserVault: caller is not a spender");
        _;
    }

    constructor(address _usdcToken) {
        require(_usdcToken != address(0), "Invalid token address");
        usdcToken = IERC20(_usdcToken);
    }

    /**
     * @notice User deposits USDC into the vault.
     * @param amount Amount of USDC to deposit.
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;

        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Deposit USDC on behalf of a user.
     * @param user The user to credit the deposit to.
     * @param amount Amount of USDC to deposit.
     */
    function depositFor(address user, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(user != address(0), "Invalid user address");

        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        balances[user] += amount;

        emit Deposited(user, amount);
    }

    /**
     * @notice User withdraws their available USDC.
     * @param amount Amount to withdraw.
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        usdcToken.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Called by authorized contracts (Accounting) to deduct user funds for DCA execution.
     * @param user The user whose funds are being spent.
     * @param amount The amount to spend.
     */
    function spend(address user, uint256 amount) external onlySpender nonReentrant {
        require(balances[user] >= amount, "Insufficient user balance");

        balances[user] -= amount;
        // The funds stay in the vault (protocol revenue/liquidity) or are moved elsewhere.
        // For this model, we assume they are "consumed" by the protocol in exchange for WBTC.
        // We can transfer them to a treasury or keep them here for withdrawal by admin.
        
        // Option A: Keep in contract, Admin withdraws later.
        // Option B: Transfer to a FeeCollector/Treasury immediately.
        
        // Let's implement Option A for simplicity, but emit event.
        emit Spent(user, msg.sender, amount);
    }

    /**
     * @notice Admin function to withdraw accumulated USDC (revenue/swapped funds).
     * @param to Recipient address.
     * @param amount Amount to withdraw.
     */
    function adminWithdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        usdcToken.safeTransfer(to, amount);
    }

    /**
     * @notice Authorize or revoke a spender contract.
     * @param spender Address of the spender contract.
     * @param active True to authorize, false to revoke.
     */
    function setSpender(address spender, bool active) external onlyOwner {
        isSpender[spender] = active;
        emit SpenderUpdated(spender, active);
    }
}
