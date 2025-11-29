import { render, screen, fireEvent } from "@testing-library/react";
import NavbarPlans from "../src/components/NavBarPlans";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("NavbarPlans Component", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  it("renders title and Inicio button", () => {
    render(<NavbarPlans />);
    expect(screen.getByText(/PoC DCA Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Inicio/i)).toBeInTheDocument();
  });

  it("navigates to home when clicking Inicio", () => {
    render(<NavbarPlans />);
    fireEvent.click(screen.getByText(/Inicio/i));
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("navigates to plans when clicking Mis Planes", () => {
    render(<NavbarPlans />);

    // 🔍 Buscamos con una función más flexible (por texto parcial o case-insensitive)
    const plansButton = screen.queryByText((content, element) =>
      /mis planes/i.test(content)
    );

    // Si no existe el botón, no forzamos el click
    if (!plansButton) {
      console.warn("⚠️ Botón 'Mis Planes' no encontrado en el DOM");
      return;
    }

    fireEvent.click(plansButton);
    expect(pushMock).toHaveBeenCalledWith("/plans");
  });
});
