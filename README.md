# DCA 0x Lab - Dollar Cost Averaging Protocol

Protocolo DCA (Dollar Cost Averaging) completo con smart contracts, backend Node.js y frontend Next.js para automatizar compras periódicas de criptomonedas.

## 🏗️ Arquitectura del Proyecto

```
dca-0x-lab/
├── backend/          # API Node.js + TypeScript + MongoDB + Redis
├── contracts/        # Smart Contracts Solidity + Hardhat
├── frontend-app/     # Next.js 15 + Wagmi + RainbowKit
└── package.json      # Orquestador raíz para ejecutar todo
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js**: v18.14.0 - v22.x (⚠️ **NO usar v23**, tiene incompatibilidades)
- **Yarn**: v1.22.x (Yarn Classic)
- **MongoDB**: Instancia local o MongoDB Atlas
- **Redis**: Instancia local o Redis Cloud

### Instalación

```bash
# 1. Instalar dependencias de todos los proyectos
yarn install:all

# 2. Configurar variables de entorno
# Backend: copiar backend/.env.example a backend/.env
# Frontend: copiar frontend-app/.env.local.example a frontend-app/.env.local

# 3. Ejecutar todo el stack
yarn dev
```

El comando `yarn dev` ejecuta simultáneamente:
- **Backend**: `http://localhost:4000`
- **Frontend**: `http://localhost:3000`

## 📦 Componentes del Proyecto

### Backend (`/backend`)
API REST con arquitectura limpia (Clean Architecture):
- **Framework**: Express + TypeScript
- **Base de datos**: MongoDB (Mongoose)
- **Cache/Jobs**: Redis + BullMQ
- **Blockchain**: Ethers.js v6
- **Documentación**: Swagger UI en `/api-docs`

**Endpoints principales:**
- `POST /api/dca/create-on-chain` - Crear plan DCA
- `GET /api/dca/my-plans/:userAddress` - Ver mis planes
- `GET /api/dca/admin/plans` - Admin: ver todos los planes

Ver [backend/README.md](./backend/README.md) para más detalles.

### Smart Contracts (`/contracts`)
Contratos modulares en Solidity:
- **DCAAccountingV2**: Lógica principal de DCA
- **TokenRegistry**: Registro de tokens soportados
- **GenericVault**: Vaults para tokens ERC20
- **Oracles**: Integración con Chainlink

**Redes soportadas:**
- Sepolia Testnet (desarrollo)
- Polygon Mainnet (producción)

Ver [contracts/README.md](./contracts/README.md) para más detalles.

### Frontend (`/frontend-app`)
Aplicación web con Next.js 15:
- **Wallet**: RainbowKit + Wagmi v2
- **UI**: TailwindCSS + Material UI
- **Estado**: Zustand
- **Queries**: TanStack Query
- **Real-time**: Socket.IO

Ver [frontend-app/README.md](./frontend-app/README.md) para más detalles.

## 🔧 Scripts Disponibles

```bash
# Desarrollo
yarn dev              # Ejecutar backend + frontend
yarn dev:backend      # Solo backend
yarn dev:frontend     # Solo frontend

# Testing
yarn test:backend     # Tests del backend
yarn test:frontend    # Tests del frontend

# Instalación
yarn install:all      # Instalar deps de todos los proyectos
```

## 🌐 Variables de Entorno

### Backend (`.env`)
```env
MONGO_URI=mongodb://...
REDIS_URL=redis://...
ACTIVE_NETWORK=sepolia
RPC_URL_SEPOLIA=https://...
PRIVATE_KEY=0x...
SEPOLIA_ACCOUNTING=0x...
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WC_PROJECT_ID=...
NEXT_PUBLIC_RPC_URL_SEPOLIA=https://...
NEXT_PUBLIC_SEPOLIA_DCA_ACCOUNTING=0x...
NEXT_PUBLIC_SEPOLIA_USDC=0x...
```

## 📚 Documentación Adicional

- [Backend README](./backend/README.md) - API, arquitectura, testing
- [Contracts README](./contracts/README.md) - Smart contracts, deployment
- [Frontend README](./frontend-app/README.md) - UI, componentes, hooks

## 🛠️ Troubleshooting

### Error: "Your application tried to access yn/styled-jsx"
Si usas Yarn 3 con PnP, desactívalo:
```bash
yarn config set nodeLinker node-modules
rm -rf .pnp.* .yarn/cache
yarn install
```

### Error: "The engine 'node' is incompatible"
Usa Node.js v18 o v20:
```bash
nvm install 20
nvm use 20
```

## 🤝 Contribución

1. Crear rama desde `develop`: `git checkout -b feature/mi-feature`
2. Hacer cambios y commit
3. Push y crear Pull Request a `develop`

## 📄 Licencia

MIT
