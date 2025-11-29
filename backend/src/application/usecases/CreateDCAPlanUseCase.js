import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
export class CreateDCAPlanUseCase {
    constructor() {
        this.repo = new DCAPlanRepository();
    }
    async execute(planData) {
        const plan = await this.repo.create(planData);
        return plan;
    }
}
