import type { DCAPlan } from "../../domain/entities/DCAPlan.ts";
import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";

export class CreateDCAPlanUseCase {
  private repo: DCAPlanRepository;

  constructor() {
    this.repo = new DCAPlanRepository();
  }

  async execute(planData: DCAPlan) {
    const plan = await this.repo.create(planData);
    return plan;
  }
}
