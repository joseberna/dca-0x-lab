import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";

export class GetActivePlansUseCase {
  private repo: DCAPlanRepository;

  constructor() {
    this.repo = new DCAPlanRepository();
  }

  async execute() {
    return this.repo.findActivePlans();
  }
}
