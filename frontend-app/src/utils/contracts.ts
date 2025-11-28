export const CONTRACTS = {
  // Sepolia Addresses
  SEPOLIA: {
    USDC: process.env.NEXT_PUBLIC_SEPOLIA_USDC || "",
    WETH: process.env.NEXT_PUBLIC_SEPOLIA_WETH || "",
    WBTC: process.env.NEXT_PUBLIC_SEPOLIA_WBTC || "",
    DCA_ACCOUNTING: process.env.NEXT_PUBLIC_SEPOLIA_DCA_ACCOUNTING || "",
    REGISTRY: process.env.NEXT_PUBLIC_SEPOLIA_REGISTRY || ""
  },
  // Polygon Addresses
  POLYGON: {
    USDC: process.env.NEXT_PUBLIC_POLYGON_USDC || "",
    WETH: process.env.NEXT_PUBLIC_POLYGON_WETH || "",
    WBTC: process.env.NEXT_PUBLIC_POLYGON_WBTC || "",
    DCA_ACCOUNTING: "" // Pending deployment
  }
};

export const getContracts = (chainId: number) => {
  return chainId === 11155111 ? CONTRACTS.SEPOLIA : CONTRACTS.POLYGON;
};
