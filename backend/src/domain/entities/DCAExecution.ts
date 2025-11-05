export interface DCAExecution {
  planId: string;
  userAddress: string;
  executedAt: Date;
  amount: string;
  txHash: string;
  status: "success" | "failed";
}
