// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenRegistry
 * @notice Central registry for managing supported tokens and their configurations
 * @dev Allows dynamic addition of tokens without contract redeployment
 */
contract TokenRegistry is Ownable {
    
    struct TokenConfig {
        address tokenAddress;   // ERC20 token address
        address oracle;         // Chainlink oracle for price feed
        address vault;          // Dedicated vault for this token
        uint8 decimals;         // Token decimals (6 for USDC, 8 for WBTC, 18 for WETH)
        bool isActive;          // Whether token is currently supported
        uint256 registeredAt;   // Timestamp of registration
    }
    
    // Symbol → TokenConfig mapping
    mapping(string => TokenConfig) private tokens;
    
    // List of all registered symbols
    string[] private tokenSymbols;
    
    // Events
    event TokenRegistered(
        string indexed symbol,
        address indexed tokenAddress,
        address oracle,
        address vault,
        uint8 decimals
    );
    
    event TokenUpdated(
        string indexed symbol,
        address indexed tokenAddress,
        address oracle,
        address vault
    );
    
    event TokenDeactivated(string indexed symbol);
    event TokenActivated(string indexed symbol);
    
    /**
     * @notice Register a new token in the system
     * @param symbol Token symbol (e.g., "WETH", "WBTC")
     * @param tokenAddress ERC20 token contract address
     * @param oracle Chainlink oracle address for this token
     * @param vault Vault contract address for this token
     * @param decimals Number of decimals for this token
     */
    function registerToken(
        string calldata symbol,
        address tokenAddress,
        address oracle,
        address vault,
        uint8 decimals
    ) external onlyOwner {
        require(bytes(symbol).length > 0, "Empty symbol");
        require(tokenAddress != address(0), "Invalid token address");
        require(oracle != address(0), "Invalid oracle address");
        require(vault != address(0), "Invalid vault address");
        require(decimals > 0 && decimals <= 18, "Invalid decimals");
        
        // Check if token already exists
        if (tokens[symbol].tokenAddress != address(0)) {
            revert("Token already registered");
        }
        
        tokens[symbol] = TokenConfig({
            tokenAddress: tokenAddress,
            oracle: oracle,
            vault: vault,
            decimals: decimals,
            isActive: true,
            registeredAt: block.timestamp
        });
        
        tokenSymbols.push(symbol);
        
        emit TokenRegistered(symbol, tokenAddress, oracle, vault, decimals);
    }
    
    /**
     * @notice Update an existing token's configuration
     * @param symbol Token symbol to update
     * @param tokenAddress New token address (use current if no change needed)
     * @param oracle New oracle address
     * @param vault New vault address
     */
    function updateToken(
        string calldata symbol,
        address tokenAddress,
        address oracle,
        address vault
    ) external onlyOwner {
        require(tokens[symbol].tokenAddress != address(0), "Token not registered");
        require(tokenAddress != address(0), "Invalid token address");
        require(oracle != address(0), "Invalid oracle address");
        require(vault != address(0), "Invalid vault address");
        
        TokenConfig storage config = tokens[symbol];
        config.tokenAddress = tokenAddress;
        config.oracle = oracle;
        config.vault = vault;
        
        emit TokenUpdated(symbol, tokenAddress, oracle, vault);
    }
    
    /**
     * @notice Deactivate a token (keeps config but marks as inactive)
     * @param symbol Token symbol to deactivate
     */
    function deactivateToken(string calldata symbol) external onlyOwner {
        require(tokens[symbol].tokenAddress != address(0), "Token not registered");
        require(tokens[symbol].isActive, "Token already inactive");
        
        tokens[symbol].isActive = false;
        emit TokenDeactivated(symbol);
    }
    
    /**
     * @notice Reactivate a previously deactivated token
     * @param symbol Token symbol to activate
     */
    function activateToken(string calldata symbol) external onlyOwner {
        require(tokens[symbol].tokenAddress != address(0), "Token not registered");
        require(!tokens[symbol].isActive, "Token already active");
        
        tokens[symbol].isActive = true;
        emit TokenActivated(symbol);
    }
    
    /**
     * @notice Get token configuration by symbol
     * @param symbol Token symbol
     * @return TokenConfig struct with all token details
     */
    function getTokenConfig(string calldata symbol) 
        external 
        view 
        returns (TokenConfig memory) 
    {
        require(tokens[symbol].tokenAddress != address(0), "Token not registered");
        return tokens[symbol];
    }
    
    /**
     * @notice Check if a token is registered and active
     * @param symbol Token symbol
     * @return bool True if token is active
     */
    function isTokenActive(string calldata symbol) external view returns (bool) {
        return tokens[symbol].isActive;
    }
    
    /**
     * @notice Get token address by symbol
     * @param symbol Token symbol
     * @return address Token contract address
     */
    function getTokenAddress(string calldata symbol) external view returns (address) {
        require(tokens[symbol].tokenAddress != address(0), "Token not registered");
        return tokens[symbol].tokenAddress;
    }
    
    /**
     * @notice Get oracle address for a token
     * @param symbol Token symbol
     * @return address Oracle contract address
     */
    function getOracle(string calldata symbol) external view returns (address) {
        require(tokens[symbol].tokenAddress != address(0), "Token not registered");
        return tokens[symbol].oracle;
    }
    
    /**
     * @notice Get vault address for a token
     * @param symbol Token symbol
     * @return address Vault contract address
     */
    function getVault(string calldata symbol) external view returns (address) {
        require(tokens[symbol].tokenAddress != address(0), "Token not registered");
        return tokens[symbol].vault;
    }
    
    /**
     * @notice Get decimals for a token
     * @param symbol Token symbol
     * @return uint8 Number of decimals
     */
    function getDecimals(string calldata symbol) external view returns (uint8) {
        require(tokens[symbol].tokenAddress != address(0), "Token not registered");
        return tokens[symbol].decimals;
    }
    
    /**
     * @notice Get all registered token symbols
     * @return string[] Array of all registered symbols
     */
    function getAllTokens() external view returns (string[] memory) {
        return tokenSymbols;
    }
    
    /**
     * @notice Get count of registered tokens
     * @return uint256 Total number of registered tokens
     */
    function getTokenCount() external view returns (uint256) {
        return tokenSymbols.length;
    }
}
