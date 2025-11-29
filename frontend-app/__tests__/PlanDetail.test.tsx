import { render, screen, waitFor } from "@testing-library/react";
import PlanDetail from "../src/pages/plans/[id]";
import axios from "axios";
import { useRouter } from "next/router";

// Mock Next Router
jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

// Mock Axios
jest.mock("axios");

// Mock Wagmi
jest.mock("wagmi", () => ({
    useChainId: () => 11155111,
}));

// Mock Store
jest.mock("../src/store/useDCAStore", () => ({
    useDCAStore: () => ({ address: "0x123", isConnected: true }),
}));

// Mock NavbarPlan
jest.mock("../src/components/NavBarPlan", () => {
    return function DummyNavbar() {
        return <div>Navbar</div>;
    };
});

describe("PlanDetail Page", () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            query: { id: "123" },
            push: jest.fn(),
        });

        (axios.get as jest.Mock).mockResolvedValue({
            data: {
                success: true,
                data: {
                    _id: "plan123",
                    tokenFrom: "USDC",
                    tokenTo: "WBTC",
                    amountPerInterval: 100,
                    intervalDays: 7,
                    totalOperations: 4,
                    executedOperations: 1,
                    status: "active",
                    executions: [
                        {
                            _id: "exec1",
                            amount: 100,
                            txHash: "0xabc123456789",
                            status: "success",
                            createdAt: "2023-01-01T00:00:00Z"
                        }
                    ]
                },
            },
        });
    });

    it("renders plan details and executions", async () => {
        render(<PlanDetail />);

        // Loading state
        expect(screen.getByText(/Cargando plan/i)).toBeInTheDocument();

        // Wait for data
        await waitFor(() => {
            expect(screen.getByText(/Detalle del Plan DCA/i)).toBeInTheDocument();
        });

        // Check content
        expect(screen.getByText("USDC")).toBeInTheDocument();
        expect(screen.getByText("WBTC")).toBeInTheDocument();
        expect(screen.getByText("100 USDC")).toBeInTheDocument();
        
        // Check execution (we slice the hash in the component)
        expect(screen.getByText(/0xabc12345.*6789/)).toBeInTheDocument();
    });
});
