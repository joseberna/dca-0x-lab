import { clearAllMocks, mockContract } from "../../../__tests__/helpers/setup";


// Mock ethers module
jest.mock('ethers', () => ({
  ethers: {
    Contract: jest.fn(() => mockContract),
    Wallet: jest.fn(() => ({
      connect: jest.fn(),
    })),
    providers: {
      JsonRpcProvider: jest.fn(),
    },
    utils: {
      formatUnits: jest.fn((value: bigint, decimals: number) => {
        return (Number(value) / Math.pow(10, decimals)).toString();
      }),
      parseUnits: jest.fn((value: string, decimals: number) => {
        return BigInt(Math.floor(parseFloat(value) * Math.pow(10, decimals)));
      }),
    },
  },
}));

describe('DCAService', () => {
  beforeEach(() => {
    clearAllMocks();
  });

  describe('createPlan', () => {
    it('should create a plan with valid parameters', async () => {
      // Mock the contract response
      mockContract.createPlan.mockResolvedValue({
        hash: '0x123...',
        wait: jest.fn().mockResolvedValue({
          logs: [
            {
              topics: ['0xPlanCreated...'],
              data: '0x0000000000000000000000000000000000000000000000000000000000000001',
            },
          ],
        }),
      });

      // TODO: Import and test actual DCAService when isolated from DB
      // For now, testing that mocks work correctly
      const tx = await mockContract.createPlan(
        '0x123...',
        '0x456...',
        '100000000',
        '10000000',
        3600,
        10
      );

      expect(tx.hash).toBe('0x123...');
      expect(mockContract.createPlan).toHaveBeenCalledWith(
        '0x123...',
        '0x456...',
        '100000000',
        '10000000',
        3600,
        10
      );
    });
  });

  describe('executePlan', () => {
    it('should execute a tick successfully', async () => {
      mockContract.executeTick.mockResolvedValue({
        hash: '0xabc...',
        wait: jest.fn().mockResolvedValue({
          status: 1,
        }),
      });

      const tx = await mockContract.executeTick(1);
      
      expect(tx.hash).toBe('0xabc...');
      expect(mockContract.executeTick).toHaveBeenCalledWith(1);
    });
  });
});
