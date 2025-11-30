import dotenv from "dotenv";
dotenv.config();
export const config = {
    PORT: process.env.PORT || 4000,
    MONGO_URI: process.env.MONGO_URI,
    RPC_URL: process.env.RPC_URL,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    MOCK_USDC_ADDRESS: process.env.MOCK_USDC_ADDRESS,
    DCA_ENGINE_ADDRESS: process.env.DCA_ENGINE_ADDRESS,
    NODE_ENV: process.env.NODE_ENV || "development",
    SC_USDC_POLYGON: process.env.SC_USDC_POLYGON,
};
