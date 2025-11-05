import { DCAService } from "../../src/application/services/DCAService";
import { DCAPlanRepository } from "../../src/domain/repositories/dcaPlan.repository";
import { DCAExecutionRepository } from "../../src/domain/repositories/dcaExecution.repository";
import { OneInchApi } from "../../src/infraestructure/integrations/oneInchApi";

// 🧩 Mocks de dependencias
jest.mock("../../src/domain/repositories/dcaPlan.repository");
jest.mock("../../src/domain/repositories/dcaExecution.repository");
jest.mock("../../src/infraestructure/integrations/oneInchApi");
jest.mock("../../src/infraestructure/blockchain/transactionSender.ts", () => ({
    sendTransaction: jest.fn().mockResolvedValue("0xmockedtxhash"),
}));

describe("💸 DCAService", () => {
    let service: DCAService;
    let mockPlanRepo: jest.Mocked<DCAPlanRepository>;
    let mockExecRepo: jest.Mocked<DCAExecutionRepository>;
    let mockOneInch: jest.Mocked<OneInchApi>;

    beforeEach(() => {
        jest.clearAllMocks();
        mockPlanRepo = new DCAPlanRepository() as any;
        mockExecRepo = new DCAExecutionRepository() as any;
        mockOneInch = new OneInchApi() as any;
        service = new DCAService();

        (service as any).planRepo = mockPlanRepo;
        (service as any).execRepo = mockExecRepo;
        (service as any).oneInch = mockOneInch;

        // ✅ Mock básico de logExecution con _id y tipo relajado
        mockExecRepo.logExecution.mockResolvedValue({
            _id: "mockedExecId",
            planId: "mockedPlanId",
            userAddress: "0xabc",
            tokenFrom: "USDC",
            tokenTo: "WBTC",
            amount: 0.5,
            status: "pending",
        } as any);
    });


    it("ejecuta un plan activo correctamente", async () => {
        mockPlanRepo.findActivePlans.mockResolvedValue([
            {
                _id: "mockedPlanId",
                userAddress: "0xabc",
                tokenFrom: "USDC",
                tokenTo: "WBTC",
                amountPerInterval: 0.5,
                intervalDays: 1,
                totalOperations: 4,
                executedOperations: 0,
                createdAt: new Date(),
            },
        ]);

        mockOneInch.buildSwap.mockResolvedValue({
            tx: {
                to: "0xrouter",
                data: "0x1234",
                value: "0",
            },
        });

        await service.executePlans();

        // 🧾 Verifica que registre la ejecución inicial
        expect(mockExecRepo.logExecution).toHaveBeenCalledWith(
            expect.objectContaining({
                userAddress: "0xabc",
                tokenFrom: "USDC",
                status: "pending",
            })
        );

        // ✅ Verifica que se haya llamado a 1inch y actualizado el estado
        expect(mockOneInch.buildSwap).toHaveBeenCalled();
        expect(mockExecRepo.updateExecutionStatus).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                status: "success",
                txHash: "0xmockedtxhash",
            })
        );
    });

    it("maneja errores de 1inch correctamente", async () => {
        mockPlanRepo.findActivePlans.mockResolvedValue([
            {
                _id: "mockedPlanId",
                userAddress: "0xabc",
                tokenFrom: "USDC",
                tokenTo: "WBTC",
                amountPerInterval: 0.5,
                intervalDays: 1,
                totalOperations: 4,
                executedOperations: 0,
                createdAt: new Date(),
            },
        ]);

        mockOneInch.buildSwap.mockRejectedValue(new Error("1inch swap failed"));

        await service.executePlans();

        expect(mockExecRepo.logExecution).toHaveBeenCalledWith(
            expect.objectContaining({ status: "failed" })
        );
    });
});
