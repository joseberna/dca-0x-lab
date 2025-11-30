import { DCAAdminController } from "../../infraestructure/api/controllers/DCAAdminController.ts";
import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
import { DCAExecutionRepository } from "../../domain/repositories/dcaExecution.repository.ts";
// Mock de los repositorios
jest.mock("../../domain/repositories/dcaPlan.repository.ts");
jest.mock("../../domain/repositories/dcaExecution.repository.ts");
describe("DCAAdminController", () => {
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
    describe("getAllPlans", () => {
        it("should return paginated plans", async () => {
            const mockPlans = [{ _id: "plan1" }];
            const mockTotal = 1;
            DCAPlanRepository.prototype.findAll.mockResolvedValue(mockPlans);
            DCAPlanRepository.prototype.countAll.mockResolvedValue(mockTotal);
            req.query = { page: "1", limit: "10" };
            await DCAAdminController.getAllPlans(req, res);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockPlans,
                pagination: {
                    total: mockTotal,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            });
        });
        it("should handle errors", async () => {
            DCAPlanRepository.prototype.findAll.mockRejectedValue(new Error("DB Error"));
            await DCAAdminController.getAllPlans(req, res);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                success: false,
                message: "DB Error",
            });
        });
    });
    describe("getPlanDetails", () => {
        it("should return plan details with executions", async () => {
            const mockPlan = { _id: "plan1", toObject: () => ({ _id: "plan1" }) };
            const mockExecutions = [{ _id: "exec1" }];
            DCAPlanRepository.prototype.findById.mockResolvedValue(mockPlan);
            DCAExecutionRepository.prototype.findByPlan.mockResolvedValue(mockExecutions);
            req.params = { planId: "plan1" };
            await DCAAdminController.getPlanDetails(req, res);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: {
                    _id: "plan1",
                    executions: mockExecutions,
                },
            });
        });
        it("should return 404 if plan not found", async () => {
            DCAPlanRepository.prototype.findById.mockResolvedValue(null);
            req.params = { planId: "plan1" };
            await DCAAdminController.getPlanDetails(req, res);
            expect(statusMock).toHaveBeenCalledWith(404);
        });
    });
});
