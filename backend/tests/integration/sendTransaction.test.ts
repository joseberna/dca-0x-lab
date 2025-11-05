import { sendTransaction } from "../../src/infraestructure/blockchain/transactionSender";
import { ethers } from "ethers";

jest.mock("ethers");

describe("⛓️ sendTransaction", () => {
  const mockSendTransaction = jest.fn().mockResolvedValue({
    hash: "0x123",
    wait: jest.fn().mockResolvedValue({ blockNumber: 123 }),
  });

  const mockWallet = { sendTransaction: mockSendTransaction };
  const mockProvider = {};

  beforeEach(() => {
    (ethers.Wallet as any).mockImplementation(() => mockWallet);
    (ethers.JsonRpcProvider as any).mockImplementation(() => mockProvider);
    process.env.PRIVATE_KEY = "0xa".padEnd(66, "1");
    process.env.RPC_URL = "https://mocked.rpc";
  });

  it("envía una transacción correctamente", async () => {
    const tx = { to: "0xrouter", data: "0x1234", value: "0" };
    const hash = await sendTransaction(tx);

    expect(mockSendTransaction).toHaveBeenCalled();
    expect(hash).toBe("0x123");
  });

  it("lanza error si falta private key", async () => {
    process.env.PRIVATE_KEY = "";
    await expect(sendTransaction({})).rejects.toThrow("Invalid private key");
  });
});
