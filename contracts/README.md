# ⛓️ DCA 0x Lab Smart Contracts

Colección de contratos inteligentes en Solidity para el protocolo de Dollar Cost Averaging (DCA). Diseñados para ser modulares, seguros y eficientes en gas.

---

## 📜 Contratos Principales

### 1. `DCAAccountingV2.sol`
El núcleo del protocolo. Gestiona:
- Creación y almacenamiento de planes DCA.
- Ejecución de "ticks" (compras periódicas).
- Cálculo de swaps y gestión de balances internos.
- Emisión de eventos para trazabilidad off-chain.

### 2. `GenericVault.sol`
Bóvedas seguras para custodiar los activos de los usuarios y del protocolo.
- **UserVault**: Custodia los fondos de los usuarios.
- **TreasuryVault**: Custodia la liquidez del protocolo para realizar los swaps.

### 3. `TokenRegistry.sol`
Registro centralizado de tokens soportados, sus oráculos de precio y configuraciones (decimales, direcciones).

---

## 🛠 Instalación y Compilación

### Prerrequisitos
- Node.js v18+
- Hardhat

### Instalación
```bash
cd contracts
yarn install
```

### Compilación
```bash
npx hardhat compile
```

---

## 🚀 Despliegue

El proyecto utiliza scripts de Hardhat para el despliegue. El script principal es `deployMultiToken.js`, que maneja el despliegue de todo el ecosistema (Registry, Vaults, Accounting, Mocks).

### Desplegar en Sepolia (Testnet)
```bash
npx hardhat run scripts/deployMultiToken.js --network sepolia
```

### Desplegar en Polygon (Mainnet)
```bash
npx hardhat run scripts/deployMultiToken.js --network polygon
```

> **Nota**: Asegúrate de configurar las variables de entorno en `.env` (ver sección de configuración).

---

## ✅ Verificación

Para verificar los contratos en Etherscan o PolygonScan:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

Ejemplo:
```bash
npx hardhat verify --network sepolia 0x123... "0xArg1..." "0xArg2..."
```

---

## 🧪 Testing

Ejecutar la suite de pruebas (Hardhat + Ethers.js):

```bash
npx hardhat test
```

---

## ⚙️ Configuración (.env)

Crea un archivo `.env` en `contracts/` con:

```env
# 🔑 Private Keys
PRIVATE_KEY=0x...

# 🌐 RPC URLs
RPC_URL_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/...
RPC_URL_POLYGON=https://polygon-rpc.com

# 🔎 API Keys (Verificación)
ETHERSCAN_API_KEY=...
POLYGONSCAN_API_KEY=...
```

---

## 📦 Direcciones Desplegadas (Referencia)

| Contrato | Red | Dirección |
|----------|-----|-----------|
| DCAAccountingV2 | Sepolia | `0x...` (Ver logs de despliegue) |
| TokenRegistry | Sepolia | `0x...` |
| MockUSDC | Sepolia | `0x...` |

---

## 👨‍💻 Desarrollador

**José Fernando Berna**
*Blockchain Engineer & Full Stack Developer*
