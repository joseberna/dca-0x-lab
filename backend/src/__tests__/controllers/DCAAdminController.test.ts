import { Request, Response } from "express";
import { DCAAdminController } from "../../infraestructure/api/controllers/DCAAdminController.ts";
import { DCAPlanRepository } from "../../domain/repositories/dcaPlan.repository.ts";
import { DCAExecutionRepository } from "../../domain/repositories/dcaExecution.repository.ts";

// Mock de los repositorios
jest.mock("../../domain/repositories/dcaPlan.repository.ts");
jest.mock("../../domain/repositories/dcaExecution.repository.ts");

describe("DCAAdminController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

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

      (DCAPlanRepository.prototype.findAll as jest.Mock).mockResolvedValue(mockPlans);
      (DCAPlanRepository.prototype.countAll as jest.Mock).mockResolvedValue(mockTotal);

      req.query = { page: "1", limit: "10" };

      await DCAAdminController.getAllPlans(req as Request, res as Response);

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
      (DCAPlanRepository.prototype.findAll as jest.Mock).mockRejectedValue(new Error("DB Error"));

      await DCAAdminController.getAllPlans(req as Request, res as Response);

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

      (DCAPlanRepository.prototype.findById as jest.Mock).mockResolvedValue(mockPlan);
      (DCAExecutionRepository.prototype.findByPlan as jest.Mock).mockResolvedValue(mockExecutions);

      req.params = { planId: "plan1" };

      await DCAAdminController.getPlanDetails(req as Request, res as Response);

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
      (DCAPlanRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      req.params = { planId: "plan1" };

      await DCAAdminController.getPlanDetails(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
    });
  });
});
