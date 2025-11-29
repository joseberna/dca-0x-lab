// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title GenericVault
 * @notice Reusable vault for any ERC20 token
 * @dev Can be used for USDC, WETH, WBTC, or any other ERC20
 */
contract GenericVault is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    
    // User balances
    mapping(address => uint256) public balances;
    
    // Authorized spenders (e.g., DCAAccounting contract)
    mapping(address => bool) public authorizedSpenders;
    
    // Events
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Spent(address indexed user, uint256 amount);
    event SpenderAuthorized(address indexed spender, bool authorized);

    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }

    /**
     * @notice Authorize or revoke a spender
     * @param spender Address to authorize/revoke
     * @param authorized True to authorize, false to revoke
     */
    function setSpender(address spender, bool authorized) external onlyOwner {
        require(spender != address(0), "Invalid spender");
        authorizedSpenders[spender] = authorized;
        emit SpenderAuthorized(spender, authorized);
    }

    /**
     * @notice Deposit tokens into the vault
     * @param amount Amount to deposit
     */
    function deposit(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        
        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Deposit tokens on behalf of a user (used by DCA system)
     * @param user User address
     * @param amount Amount to deposit
     */
    function depositFor(address user, uint256 amount) external {
        require(user != address(0), "Invalid user");
        require(amount > 0, "Amount must be > 0");
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        balances[user] += amount;
        
        emit Deposited(user, amount);
    }

    /**
     * @notice Withdraw tokens from the vault
     * @param amount Amount to withdraw
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        balances[msg.sender] -= amount;
        token.safeTransfer(msg.sender, amount);
        
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Spend tokens on behalf of a user (only authorized spenders)
     * @param user User whose tokens to spend
     * @param amount Amount to spend
     */
    function spend(address user, uint256 amount) external {
        require(authorizedSpenders[msg.sender], "Not authorized");
        require(amount > 0, "Amount must be > 0");
        require(balances[user] >= amount, "Insufficient balance");
        
        balances[user] -= amount;
        
        emit Spent(user, amount);
    }

    /**
     * @notice Transfer tokens from vault to a recipient (only authorized spenders)
     * @param user User whose funds to use
     * @param recipient Recipient address
     * @param amount Amount to transfer
     */
    function transferTo(address user, address recipient, uint256 amount) external {
        require(authorizedSpenders[msg.sender], "Not authorized");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        require(balances[user] >= amount, "Insufficient balance");
        
        balances[user] -= amount;
        token.safeTransfer(recipient, amount);
        
        emit Spent(user, amount);
        emit Withdrawn(user, amount);
    }

    /**
     * @notice Deposit inventory tokens (used by Treasury)
     * @param amount Amount to deposit
     */
    function depositInventory(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Get vault's total token balance
     * @return uint256 Total balance held by vault
     */
    function totalBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /**
     * @notice Withdraw inventory tokens (only authorized spenders)
     * @dev Used by DCAAccounting to send swapped tokens to user
     * @param recipient Recipient address
     * @param amount Amount to withdraw
     */
    function withdrawInventory(address recipient, uint256 amount) external {
        require(authorizedSpenders[msg.sender], "Not authorized");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        
        token.safeTransfer(recipient, amount);
        
        emit Withdrawn(recipient, amount);
    }

    /**
     * @notice Get user's balance in vault
     * @param user User address
     * @return uint256 User's balance
     */
    function balanceOf(address user) external view returns (uint256) {
        return balances[user];
    }
}
