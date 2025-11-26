/**
 * Test helpers and setup
 */

// Mock environment variables for tests
process.env.ACTIVE_NETWORK = 'hardhat';
process.env.MONGODB_URI = 'mongodb://localhost:27017/dca-test';
process.env.REDIS_URI = 'redis://localhost:6379';
process.env.SM_ACCOUNTING_HARDHAT = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
process.env.PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

/**
 * Mock Ethers providers to avoid real blockchain calls
 */
export const mockProvider = {
  getNetwork: jest.fn().mockResolvedValue({ name: 'hardhat', chainId: 31337 }),
  getBlockNumber: jest.fn().mockResolvedValue(100),
};

/**
 * Mock contract instance
 */
export const mockContract = {
  createPlan: jest.fn(),
  executeTick: jest.fn(),
  plans: jest.fn(),
  on: jest.fn(),
  removeAllListeners: jest.fn(),
};

/**
 * Helper to clear all mocks
 */
export const clearAllMocks = () => {
  jest.clearAllMocks();
};
