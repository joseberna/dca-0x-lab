/**
 * Network Configuration
 * Centralized config for multi-network DCA system
 */

export interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  icon: string;
  coingeckoId: string;
  description: string;
}

export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  tokens: Record<string, string>;
  oracles: Record<string, string>;
  vaults: Record<string, string>;
  contracts: {
    registry: string;
    accounting: string;
  };
}

/**
 * Supported tokens metadata
 */
export const SUPPORTED_TOKENS: Record<string, TokenMetadata> = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: '/icons/usdc.svg',
    coingeckoId: 'usd-coin',
    description: 'Stablecoin pegged to USD'
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    icon: '/icons/eth.svg',
    coingeckoId: 'weth',
    description: 'Wrapped Ethereum'
  },
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    icon: '/icons/btc.svg',
    coingeckoId: 'wrapped-bitcoin',
    description: 'Wrapped Bitcoin on Ethereum'
  },
  SOL: {
    symbol: 'SOL',
    name: 'Wrapped Solana',
    decimals: 9,
    icon: '/icons/sol.svg',
    coingeckoId: 'solana',
    description: 'Wrapped Solana on Ethereum'
  }
};

/**
 * Network configurations
 */
export const NETWORKS: Record<string, NetworkConfig> = {
  sepolia: {
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL || process.env.RPC_URL_SEPOLIA || 'https://rpc.sepolia.org',
    blockExplorer: 'https://sepolia.etherscan.io',
    tokens: {
      USDC: process.env.SEPOLIA_USDC_TOKEN || process.env.USDC_ADDRESS || '',
      WETH: process.env.SEPOLIA_WETH_TOKEN || process.env.WETH_ADDRESS || '',
      WBTC: process.env.SEPOLIA_WBTC_TOKEN || process.env.WBTC_ADDRESS || '',
    },
    oracles: {
      USDC: process.env.SEPOLIA_USDC_ORACLE || '',
      WETH: process.env.SEPOLIA_WETH_ORACLE || '',
      WBTC: process.env.SEPOLIA_WBTC_ORACLE || '',
    },
    vaults: {
      USDC: process.env.SEPOLIA_USDC_VAULT || process.env.TREASURY_ADDRESS || '',
      WETH: process.env.SEPOLIA_WETH_VAULT || process.env.TREASURY_ADDRESS || '',
      WBTC: process.env.SEPOLIA_WBTC_VAULT || process.env.TREASURY_ADDRESS || '',
    },
    contracts: {
      registry: process.env.SEPOLIA_REGISTRY || '',
      accounting: process.env.SEPOLIA_ACCOUNTING || process.env.DCA_ACCOUNTING_ADDRESS || '',
    }
  },
  mainnet: {
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: process.env.MAINNET_RPC_URL || '',
    blockExplorer: 'https://etherscan.io',
    tokens: {
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    },
    oracles: {
      USDC: '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
      WETH: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      WBTC: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    },
    vaults: {
      USDC: process.env.MAINNET_USDC_VAULT || '',
      WETH: process.env.MAINNET_WETH_VAULT || '',
      WBTC: process.env.MAINNET_WBTC_VAULT || '',
    },
    contracts: {
      registry: process.env.MAINNET_REGISTRY || '',
      accounting: process.env.MAINNET_ACCOUNTING || '',
    }
  }
};

/**
 * Get current network configuration
 */
export function getCurrentNetwork(): NetworkConfig {
  const activeNetwork = process.env.ACTIVE_NETWORK || 'sepolia';
  const config = NETWORKS[activeNetwork];
  
  if (!config) {
    throw new Error(`Network ${activeNetwork} not configured`);
  }
  
  return config;
}

/**
 * Get token configuration
 */
export function getTokenConfig(symbol: string): TokenMetadata {
  const token = SUPPORTED_TOKENS[symbol];
  
  if (!token) {
    throw new Error(`Token ${symbol} not supported`);
  }
  
  return token;
}

/**
 * Get all supported token symbols
 */
export function getSupportedTokens(): string[] {
  return Object.keys(SUPPORTED_TOKENS);
}

/**
 * Validate network configuration
 */
export function validateNetworkConfig(network: string): boolean {
  const config = NETWORKS[network];
  
  if (!config) return false;
  
  // Check required addresses are set
  const hasTokens = Object.values(config.tokens).every(addr => addr !== '');
  const hasContracts = config.contracts.registry !== '' && config.contracts.accounting !== '';
  
  return hasTokens && hasContracts;
}
