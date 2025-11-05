export type DCAPlanStatus = "active" | "paused" | "completed";

export interface DCAPlan {
  _id?: string;
  userAddress: string;
  tokenFrom: string;
  tokenTo: string;
  amountPerInterval: number;
  intervalDays: number;
  totalOperations: number;
  executedOperations?: number;
  status?: DCAPlanStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DCAPlanRuntime = {};
