import { render, screen, waitFor } from "@testing-library/react";
import PlanDetail from "../src/pages/plans/[id]";
import axios from "axios";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

jest.mock("axios");

describe("PlanDetail Page", () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            query: { id: "123" },
            push: jest.fn(),
        });

        (axios.get as jest.Mock).mockResolvedValue({
            data: {
                success: true,
                data: [
                    {
                        _id: "exec1",
                        amount: 0.5,
                        txHash: "0x123abc",
                        status: "success",
                        timestamp: "2025-11-04T19:00:00Z",
                        tokenFrom: "USDC",
                        tokenTo: "WBTC",
                        amountPerInterval: 0.5,
                        intervalDays: 7,
                        totalOperations: 4,
                        executedOperations: 2,
                        statusPlan: "active",
                    },
                ],
            },
        });
    });

    // it("renders plan info and successful executions", async () => {
    //     render(<PlanDetail />);

    //     // Esperamos que se muestre "Cargando plan..."
    //     expect(screen.getByText(/Cargando plan/i)).toBeInTheDocument();

    //     // Forzamos que el mock de axios se resuelva
    //     await Promise.resolve();

    //     // Esperamos que el componente se actualice
    //     await waitFor(() => {
    //         expect(screen.queryByText(/Cargando plan/i)).not.toBeInTheDocument();
    //     }, { timeout: 2000 });

    //     // Ahora verificamos el contenido
    //     expect(screen.getByText(/Plan DCA Detalle/i)).toBeInTheDocument();
    //     expect(screen.getByText(/USDC/i)).toBeInTheDocument();
    //     expect(screen.getByText(/WBTC/i)).toBeInTheDocument();
    //     expect(screen.getByText(/Ejecuciones realizadas/i)).toBeInTheDocument();
    // });

});
