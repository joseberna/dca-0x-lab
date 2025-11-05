import { render, screen, fireEvent } from "@testing-library/react";
import NavbarPlans from "../src/components/NavbarPlans";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("NavbarPlans Component", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  it("renders the dashboard title", () => {
    render(<NavbarPlans />);
    expect(screen.getByText("💸 PoC DCA Dashboard")).toBeInTheDocument();
  });

  it("navigates to home when clicking Inicio", () => {
    render(<NavbarPlans />);
    fireEvent.click(screen.getByText("Inicio"));
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("navigates to plans when clicking Mis Planes", () => {
    render(<NavbarPlans />);
    fireEvent.click(screen.getByText("Mis Planes"));
    expect(pushMock).toHaveBeenCalledWith("/plans");
  });
});
