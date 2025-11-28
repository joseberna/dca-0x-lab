// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DCATreasuryVault
 * @notice Holds the protocol's inventory of WBTC.
 * @dev Used to fulfill DCA orders. Only authorized spenders (Accounting) can trigger transfers to users.
 */
contract DCATreasuryVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable wbtcToken;

    // Authorized spenders (e.g., DCAAccounting contract)
    mapping(address => bool) public isSpender;

    event InventoryDeposited(address indexed depositor, uint256 amount);
    event InventoryWithdrawn(address indexed to, uint256 amount);
    event SpenderUpdated(address indexed spender, bool active);

    modifier onlySpender() {
        require(isSpender[msg.sender], "DCATreasuryVault: caller is not a spender");
        _;
    }

    constructor(address _wbtcToken) {
        require(_wbtcToken != address(0), "Invalid token address");
        wbtcToken = IERC20(_wbtcToken);
    }

    /**
     * @notice Admin or Bot deposits WBTC inventory.
     * @param amount Amount of WBTC to deposit.
     */
    function depositInventory(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        wbtcToken.safeTransferFrom(msg.sender, address(this), amount);
        emit InventoryDeposited(msg.sender, amount);
    }

    /**
     * @notice Called by authorized contracts (Accounting) to send WBTC to a user.
     * @param recipient The user receiving WBTC.
     * @param amount The amount of WBTC to send.
     */
    function withdrawTo(address recipient, uint256 amount) external onlySpender nonReentrant {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        
        uint256 balance = wbtcToken.balanceOf(address(this));
        require(balance >= amount, "Insufficient treasury inventory");

        wbtcToken.safeTransfer(recipient, amount);
        emit InventoryWithdrawn(recipient, amount);
    }

    /**
     * @notice Admin function to withdraw WBTC (emergency or rebalancing).
     * @param to Recipient address.
     * @param amount Amount to withdraw.
     */
    function adminWithdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        wbtcToken.safeTransfer(to, amount);
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
