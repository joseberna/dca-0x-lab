export const TOKENS_BY_NETWORK = {
  // Sepolia Testnet
  11155111: [
    { symbol: "WETH", name: "Wrapped Ether", address: process.env.NEXT_PUBLIC_SEPOLIA_WETH || "" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", address: process.env.NEXT_PUBLIC_SEPOLIA_WBTC || "" },
  ],

  // Polygon Mainnet
  137: [
    { symbol: "WETH", name: "Wrapped Ether", address: process.env.NEXT_PUBLIC_POLYGON_WETH || "" },
    { symbol: "WBTC", name: "Wrapped Bitcoin", address: process.env.NEXT_PUBLIC_POLYGON_WBTC || "" },
  ],
};
