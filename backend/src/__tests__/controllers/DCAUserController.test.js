import { DCAUserController } from "../../infraestructure/api/controllers/DCAUserController.ts";
import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
import { DCAExecutionRepository } from "../../domain/repositories/dcaExecution.repository.ts";
// Mock de los repositorios
jest.mock("../../domain/repositories/dcaPlan.repository.ts");
jest.mock("../../domain/repositories/dcaExecution.repository.ts");
describe("DCAUserController", () => {
    let req;
    let res;
    let jsonMock;
    let statusMock;
    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = {
            query: {},
            params: {},
        };
        res = {
            status: statusMock,
            json: jsonMock,
        };
        jest.clearAllMocks();
    });
    describe("getMyPlans", () => {
        it("should return user plans", async () => {
            const mockPlans = [{ _id: "plan1", userAddress: "0x123" }];
            DCAPlanRepository.prototype.findByUser.mockResolvedValue(mockPlans);
            req.params = { userAddress: "0x123" };
            await DCAUserController.getMyPlans(req, res);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockPlans,
            });
        });
        it("should return 400 if userAddress is missing", async () => {
            req.params = {};
            await DCAUserController.getMyPlans(req, res);
            expect(statusMock).toHaveBeenCalledWith(400);
        });
    });
    describe("getMyPlanDetails", () => {
        it("should return plan details if user owns the plan", async () => {
            const mockPlan = {
                _id: "plan1",
                userAddress: "0x123",
                toObject: () => ({ _id: "plan1", userAddress: "0x123" })
            };
            const mockExecutions = [{ _id: "exec1" }];
            DCAPlanRepository.prototype.findById.mockResolvedValue(mockPlan);
            DCAExecutionRepository.prototype.findByPlan.mockResolvedValue(mockExecutions);
            req.params = { planId: "plan1", userAddress: "0x123" };
            await DCAUserController.getMyPlanDetails(req, res);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    _id: "plan1",
                    userAddress: "0x123",
                    executions: mockExecutions,
                },
            });
        });
        it("should return 403 if user does not own the plan", async () => {
            const mockPlan = {
                _id: "plan1",
                userAddress: "0xOtherUser",
                toObject: () => ({ _id: "plan1", userAddress: "0xOtherUser" })
            };
            DCAPlanRepository.prototype.findById.mockResolvedValue(mockPlan);
            req.params = { planId: "plan1", userAddress: "0x123" };
            await DCAUserController.getMyPlanDetails(req, res);
            expect(statusMock).toHaveBeenCalledWith(403);
        });
    });
});
