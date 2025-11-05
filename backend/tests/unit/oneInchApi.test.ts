import axios from "axios";
import { OneInchApi } from "../../src/infraestructure/integrations/oneInchApi";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("🌐 OneInchApi", () => {
    beforeEach(() => {
        process.env.ONEINCH_API_BASE = "https://api.1inch.dev/swap/v6.0/137";
        process.env.ONEINCH_API_KEY = "mockedkey";
    });

    it("arma la URL y headers correctamente", async () => {
        const api = new OneInchApi(); // 👈 mover aquí, después del beforeEach
        mockedAxios.get.mockResolvedValue({ data: { ok: true } });

        const result = await api.buildSwap("USDC", "WBTC", "1000", "0xabc");

        expect(mockedAxios.get).toHaveBeenCalledWith(
            expect.stringContaining("fromTokenAddress=USDC"),
            expect.objectContaining({
                headers: { Authorization: "Bearer mockedkey" },
            })
        );
        expect(result).toEqual({ ok: true });
    });

   
});