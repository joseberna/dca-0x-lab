import { ethers } from "ethers";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const network = await provider.getNetwork();
    console.log(`🌐 Connected to network: ${network.name} (chainId: ${network.chainId})`);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log(`👛 Wallet address: ${wallet.address}`);
    const USDC = process.env.SC_USDC_POLYGON;
    const oneInchRouter = "0x111111125421ca6dc452d289314280a0f8842a65";
    const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function allowance(address owner, address spender) external view returns (uint256)",
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() view returns (uint8)",
    ];
    const usdc = new ethers.Contract(USDC, erc20Abi, wallet);
    // 1️⃣ Obtener decimales
    let decimals = 6;
    try {
        decimals = await usdc.decimals();
    }
    catch {
        console.warn("⚠️ No se pudo leer decimals(), usando valor por defecto 6.");
    }
    // 2️⃣ Intentar balance vía RPC (Alchemy o Infura)
    let balance = 0n;
    try {
        balance = await usdc.balanceOf(wallet.address);
        console.log(`✅ Balance obtenido desde RPC: ${ethers.formatUnits(balance, decimals)} USDC`);
    }
    catch (err) {
        console.warn("⚠️ Error leyendo balance vía RPC:", err);
        // 3️⃣ Fallback Etherscan API V2 (si PolygonScan no responde aún)
        try {
            console.log("⚠️ Usando fallback Etherscan API V2...");
            const url = `https://api.etherscan.io/v2/api?chainid=137`;
            const payload = {
                jsonrpc: "2.0",
                id: 1,
                method: "account.tokenbalance",
                params: [wallet.address, USDC],
            };
            const { data } = await axios.post(url, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.POLYGONSCAN_API_KEY,
                },
            });
            if (data?.result?.tokenBalance) {
                balance = BigInt(data.result.tokenBalance);
                console.log(`✅ Balance obtenido desde Etherscan V2: ${ethers.formatUnits(balance, decimals)} USDC`);
            }
            else {
                console.error("❌ Error en respuesta Etherscan V2:", data);
            }
        }
        catch (fallbackErr) {
            console.error("❌ Error también en fallback Etherscan V2:", fallbackErr);
        }
    }
    // 4️⃣ Consultar allowance actual
    const allowance = await usdc.allowance(wallet.address, oneInchRouter);
    console.log(`🔓 Allowance actual: ${ethers.formatUnits(allowance, decimals)} USDC`);
    // 5️⃣ Si el allowance ya es suficiente, salir
    if (allowance > ethers.parseUnits("1", decimals)) {
        console.log("✅ Ya existe un allowance suficiente. No se necesita aprobar nuevamente.");
        return;
    }
    // 6️⃣ Aprobar nuevo allowance
    const amount = ethers.parseUnits("10", decimals);
    console.log(`⏳ Aprobando ${ethers.formatUnits(amount, decimals)} USDC para 1inch router...`);
    const tx = await usdc.approve(oneInchRouter, amount);
    console.log("📤 Transacción enviada:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ USDC aprobado correctamente en el bloque:", receipt.blockNumber);
}
main().catch(console.error);
