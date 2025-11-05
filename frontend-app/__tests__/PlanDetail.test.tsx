import { render, screen, waitFor } from "@testing-library/react";
import PlanDetail from "../src/pages/plans/[id]";
import axios from "axios";
import { useRouter } from "next/router";

jest.mock("axios");
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("PlanDetail Page", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ query: { id: "123" } });
    localStorage.setItem("selectedPlan", JSON.stringify({
      tokenFrom: "USDC",
      tokenTo: "WBTC",
      totalOperations: 4,
      executedOperations: 2,
      intervalDays: 7,
      amountPerInterval: 0.5,
      status: "active"
    }));
  });

  it("renders plan info and successful executions", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: {
        success: true,
        data: [
          { _id: "1", amount: 0.5, status: "success", txHash: "0x123abc", createdAt: "2025-11-05T00:00:00Z" },
          { _id: "2", amount: 0.5, status: "failed" }
        ]
      },
    });

    render(<PlanDetail />);

    await waitFor(() => {
      expect(screen.getByText(/USDC/)).toBeInTheDocument();
      expect(screen.getByText(/WBTC/)).toBeInTheDocument();
      expect(screen.getByText(/active/)).toBeInTheDocument();
      expect(screen.getByText(/0x123abc/)).toBeInTheDocument();
    });
  });
});
