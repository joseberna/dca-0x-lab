import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
import { DCAPlanModel } from "../../domain/models/DCAPlanModel.ts";
// Mock del modelo de Mongoose
jest.mock("../../domain/models/DCAPlanModel.ts");
describe("DCAPlanRepository", () => {
    let repository;
    beforeEach(() => {
        repository = new DCAPlanRepository();
        jest.clearAllMocks();
    });
    describe("findAll", () => {
        it("should return paginated plans", async () => {
            const mockPlans = [{ _id: "plan1" }, { _id: "plan2" }];
            const mockFind = {
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockPlans),
            };
            DCAPlanModel.find.mockReturnValue(mockFind);
            const result = await repository.findAll(1, 10, {});
            expect(DCAPlanModel.find).toHaveBeenCalledWith({});
            expect(mockFind.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(mockFind.skip).toHaveBeenCalledWith(0);
            expect(mockFind.limit).toHaveBeenCalledWith(10);
            expect(result).toEqual(mockPlans);
        });
    });
    describe("countAll", () => {
        it("should return count of documents", async () => {
            DCAPlanModel.countDocuments.mockResolvedValue(5);
            const result = await repository.countAll({});
            expect(DCAPlanModel.countDocuments).toHaveBeenCalledWith({});
            expect(result).toBe(5);
        });
    });
    describe("findByUser", () => {
        it("should return plans for a specific user", async () => {
            const mockPlans = [{ userAddress: "0x123" }];
            const mockFind = {
                lean: jest.fn().mockResolvedValue(mockPlans),
            };
            DCAPlanModel.find.mockReturnValue(mockFind);
            const result = await repository.findByUser("0x123");
            expect(DCAPlanModel.find).toHaveBeenCalledWith({ userAddress: "0x123" });
            expect(result).toEqual(mockPlans);
        });
    });
});
