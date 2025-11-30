import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
export class GetActivePlansUseCase {
    constructor() {
        this.repo = new DCAPlanRepository();
    }
    async execute() {
        return this.repo.findActivePlans();
    }
}
