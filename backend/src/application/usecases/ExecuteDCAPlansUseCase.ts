import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
import { io } from "../../infraestructure/sockets/socketServer.ts";

export class ExecuteDCAPlansUseCase {
  private repo: DCAPlanRepository;

  constructor() {
    this.repo = new DCAPlanRepository();
  }

  async execute() {
    const plans = await this.repo.findActivePlans();
    for (const plan of plans) {
      await this.repo.incrementExecution(plan._id!);

      io.emit("plan_executed", {
        planId: plan._id,
        userAddress: plan.userAddress,
        message: `Executed one DCA operation for ${plan.tokenTo}`,
      });

      // DCA plan executed successfully
    }
  }
}
