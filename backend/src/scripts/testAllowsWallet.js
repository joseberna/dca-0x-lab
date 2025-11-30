import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
// ✅ Cargar variables de entorno ANTES de usarlas
dotenv.config();
// ✅ Verificar que la private key existe
if (!process.env.PRIVATE_KEY) {
    throw new Error("❌ PRIVATE_KEY no definida en el archivo .env");
}
// ✅ Validar formato de la private key
if (!process.env.PRIVATE_KEY.startsWith("0x") || process.env.PRIVATE_KEY.length !== 66) {
    throw new Error("❌ PRIVATE_KEY inválida. Debe comenzar con 0x y tener 66 caracteres.");
}
console.log("🔑 Usando wallet de pruebas:", process.env.PRIVATE_KEY.slice(0, 10) + "...");
// ✅ Cargar ABI del router directamente desde el sistema de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const abiPath = path.resolve(__dirname, "../infraestructure/blockchain/abi/UniswapV3Router.json");
const IUniswapV3RouterABI = JSON.parse(fs.readFileSync(abiPath, "utf-8"));
// ✅ Inicializar provider y wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_SEPOLIA_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log("✅ Conectado con la wallet:", await wallet.getAddress());
// ✅ Instanciar contrato USDC (no el router)
const usdcAddress = toSafeAddress(process.env.SM_USDC_SEPOLIA);
const routerAddress = process.env.UNISWAP_ROUTER; // Uniswap V3 Router Sepolia
const usdc = new ethers.Contract(usdcAddress, [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 value) returns (bool)"
], wallet);
(async () => {
    console.log("🔎 Verificando allowance actual...");
    const allowance = await usdc.allowance(await wallet.getAddress(), routerAddress);
    console.log("💰 Allowance actual:", allowance.toString());
    if (allowance === 0n) {
        console.log("⚙️ Ejecutando aprobación del router para gastar USDC...");
        const tx = await usdc.approve(routerAddress, ethers.MaxUint256);
        console.log("🚀 Tx enviada:", tx.hash);
        await tx.wait();
        console.log("✅ Router aprobado correctamente.");
    }
    else {
        console.log("✅ Ya estaba aprobado, no es necesario ejecutar approve nuevamente.");
    }
})();
function toSafeAddress(addr) {
    try {
        return ethers.getAddress(addr);
    }
    catch {
        // Si el checksum no es válido, forzamos lowerCase
        return addr.toLowerCase();
    }
}
