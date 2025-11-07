export const TOKENS_BY_NETWORK = {
  // Ethereum Mainnet
  1: [
    { symbol: "ETH", name: "Ethereum", address: "native" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
    { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
  ],

  // Sepolia Testnet
  11155111: [
    { symbol: "ETH", name: "Ethereum", address: "native" },
    { symbol: "WBTC", name: "Wrapped Bitcoin (test)", address: "0xD97d1f4A25A6Aa0f9c3dDd6F25fCc7E64c8F6a77" },
    { symbol: "USDC", name: "USD Coin (test)", address: "0x07865c6E87B9F70255377e024ace6630C1Eaa37F" },
  ],

  // Polygon Mainnet
  137: [
    { symbol: "MATIC", name: "Polygon", address: "native" },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" },
    { symbol: "USDC", name: "USD Coin", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" },
  ],

  // Polygon Amoy
  80002: [
    { symbol: "MATIC", name: "Polygon (Amoy)", address: "native" },
    { symbol: "WETH", name: "Wrapped Ether", address: "0x6E55A49Bda1b366c6E5c7b7D930BbF6e41C65146" },
    { symbol: "USDC", name: "USD Coin (test)", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
  ],
};
