import dotenv from "dotenv";
import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
import { WalletRepository } from "../../domain/repositories/wallet.repository.ts";

dotenv.config();

export class DCAInitService {
  private walletRepo = new WalletRepository();
  private planRepo = new DCAPlanRepository();

  async initDefaultPlan() {
    const address = process.env.DCA_WALLET!;
    const existingWallet = await this.walletRepo.findOrCreate(address);

    const plans = await this.planRepo.findByUser(address);
    if (plans.length > 0) {
      console.log(`✅ Wallet ${address} ya tiene ${plans.length} planes DCA registrados`);
      return;
    }

    const budget = Number(process.env.DCA_BUDGET_USDC || 100);
    const totalOps = Number(process.env.DCA_TOTAL_OPERATIONS || 4);
    const perOp = budget / totalOps;

    const newPlan = await this.planRepo.create({
      userAddress: address,
      tokenFrom: process.env.DCA_TOKEN_FROM!,
      tokenTo: process.env.DCA_TOKEN_TO!,
      amountPerInterval: perOp,
      intervalDays: Number(process.env.DCA_INTERVAL_DAYS || 7),
      totalOperations: totalOps,
      executedOperations: 0,
      status: "active",
    });

    console.log(`🆕 Plan DCA inicial creado para ${address}: ${perOp} ${process.env.DCA_TOKEN_FROM} cada ${process.env.DCA_INTERVAL_DAYS} días`);
    return newPlan;
  }
}
