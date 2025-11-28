# DCA Frontend - Next.js Application

Aplicación web para interactuar con el protocolo DCA (Dollar Cost Averaging). Permite a los usuarios crear y gestionar planes de compra automática de criptomonedas.

## 🎯 Características

- ✅ **Conexión de Wallet**: Integración con Metamask, WalletConnect y más vía RainbowKit
- ✅ **Multi-red**: Soporte para Sepolia (testnet) y Polygon (mainnet)
- ✅ **Gestión de Planes DCA**: Crear, visualizar y monitorear planes
- ✅ **Real-time**: Actualizaciones en vivo con Socket.IO
- ✅ **Multi-idioma**: Español, Inglés, Portugués
- ✅ **Responsive**: Diseño adaptable a móviles y desktop

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (Pages Router)
- **Web3**: Wagmi v2 + RainbowKit 2.1
- **Styling**: TailwindCSS + Material UI
- **Estado**: Zustand
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Testing**: Jest + React Testing Library

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias
yarn install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus valores
```

### Variables de Entorno

Crear archivo `.env.local`:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:4000

# WalletConnect Project ID (obtener en https://cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID=tu_project_id

# RPCs
NEXT_PUBLIC_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_RPC_URL_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Sepolia Contracts
NEXT_PUBLIC_SEPOLIA_USDC=0xd28824F4515fA0FeDD052eA70369EA6175a4e18b
NEXT_PUBLIC_SEPOLIA_WETH=0x0fe44892c3279c09654f3590cf6CedAc3FC3ccdc
NEXT_PUBLIC_SEPOLIA_WBTC=0x8762c93f84dcB6f9782602D842a587409b7Cf6cd
NEXT_PUBLIC_SEPOLIA_DCA_ACCOUNTING=0x2dE42f22a21B3163b7e61e5B508F6790d527bC25
NEXT_PUBLIC_SEPOLIA_REGISTRY=0x25a131F441aC9C87F4736c51fE35853F860C4B1e

# Polygon Contracts
NEXT_PUBLIC_POLYGON_USDC=0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
NEXT_PUBLIC_POLYGON_WETH=0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
NEXT_PUBLIC_POLYGON_WBTC=0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6
```

### Desarrollo

```bash
# Ejecutar servidor de desarrollo
yarn dev

# Abrir http://localhost:3000
```

### Testing

```bash
# Ejecutar tests
yarn test

# Tests en modo CI
yarn test:ci

# Tests con coverage
yarn test --coverage
```

### Build

```bash
# Crear build de producción
yarn build

# Ejecutar build
yarn start
```

## 📁 Estructura del Proyecto

```
frontend-app/
├── src/
│   ├── components/       # Componentes React
│   │   ├── DCAPlanForm.tsx      # Formulario crear plan
│   │   ├── Navbar.tsx           # Navegación principal
│   │   └── ...
│   ├── pages/           # Páginas Next.js
│   │   ├── index.tsx            # Home
│   │   ├── plans/               # Gestión de planes
│   │   │   ├── index.tsx        # Lista de planes
│   │   │   └── [id].tsx         # Detalle de plan
│   │   └── _app.tsx             # App wrapper (Wagmi, RainbowKit)
│   ├── hooks/           # Custom hooks
│   │   └── useSocketEvent.ts    # Hook para Socket.IO
│   ├── store/           # Estado global (Zustand)
│   │   ├── useDCAStore.ts       # Store DCA
│   │   └── useLangStore.ts      # Store idioma
│   ├── utils/           # Utilidades
│   │   └── contracts.ts         # Direcciones de contratos
│   ├── config/          # Configuración
│   │   └── tokensByNetwork.ts   # Tokens por red
│   ├── abis/            # ABIs de contratos
│   │   └── DCAAccountingV2.json
│   ├── i18n/            # Traducciones
│   │   ├── es.ts
│   │   ├── en.ts
│   │   └── pt.ts
│   └── styles/          # Estilos globales
│       └── globals.css
├── __tests__/           # Tests
├── public/              # Assets estáticos
└── package.json
```

## 🔑 Componentes Principales

### DCAPlanForm
Formulario para crear un nuevo plan DCA:
- Aprobación de USDC
- Creación de plan on-chain
- Validaciones y feedback

### PlansPage
Lista de planes DCA del usuario:
- Fetch desde API backend
- Actualización en tiempo real vía Socket.IO
- Navegación a detalle

### PlanDetail
Vista detallada de un plan:
- Información del plan
- Historial de ejecuciones
- Enlaces a exploradores de blockchain

## 🌐 Integración Web3

### Configuración de Wagmi

```typescript
// src/pages/_app.tsx
const config = getDefaultConfig({
  appName: "DCA Dashboard",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID!,
  chains: [polygon, sepolia],
  transports: {
    [polygon.id]: http(process.env.NEXT_PUBLIC_RPC_URL!),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA!),
  },
});
```

### Uso de Contratos

```typescript
import { getContracts } from '@/utils/contracts';
import { useChainId } from 'wagmi';

const chainId = useChainId();
const contracts = getContracts(chainId);
// contracts.DCA_ACCOUNTING, contracts.USDC, etc.
```

## 🧪 Testing

Los tests cubren:
- Componentes principales (Navbar, PlanDetail)
- Hooks personalizados
- Integración con mocks de Wagmi y Axios

Ejemplo:
```bash
yarn test NavbarPlans.test.tsx
```

## 🐛 Troubleshooting

### Error: "Cannot find module 'styled-jsx'"
```bash
yarn add styled-jsx
```

### Error: Wallet no se conecta
1. Verificar que `NEXT_PUBLIC_WC_PROJECT_ID` esté configurado
2. Verificar que la red esté en Wagmi config (`_app.tsx`)

### Error: Transacción falla
1. Verificar que tengas fondos en la red correcta
2. Verificar que las direcciones de contratos sean correctas
3. Revisar consola del navegador para detalles

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Wagmi Docs](https://wagmi.sh)
- [RainbowKit Docs](https://www.rainbowkit.com)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## 🤝 Contribución

Ver [../README.md](../README.md) para guías de contribución.

## 📄 Licencia

MIT
