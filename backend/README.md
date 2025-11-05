# 💸 PoC DCA Backend — Dollar Cost Averaging Automation

Backend desarrollado en **Node.js + TypeScript + MongoDB + Socket.IO** para gestionar y automatizar planes DCA (Dollar Cost Averaging) sobre la red **Polygon**, con integraciones reales a **1inch API**, ejecución programada vía **cron jobs**, y trazabilidad completa mediante logs y eventos en tiempo real.

---

## 🧩 Arquitectura del proyecto

El sistema sigue una estructura **Clean Architecture**, separando responsabilidades claramente:

```
backend/
├── src/
│   ├── application/         # Casos de uso y servicios (DCAService, DCAInitService)
│   ├── config/              # Logger, Swagger, configuración general
│   ├── domain/              # Entidades, modelos y repositorios (Mongo)
│   │   ├── entities/        # Interfaces de negocio (DCAPlan, DCAExecution, Wallet)
│   │   ├── models/          # Esquemas Mongoose
│   │   └── repositories/    # Repositorios para persistencia
│   ├── infraestructure/     # Adaptadores externos (API, DB, Sockets, 1inch, Blockchain)
│   │   ├── api/             # Servidor Express + rutas y controladores
│   │   ├── blockchain/      # Envío de transacciones a la red
│   │   ├── integrations/    # 1inch API y servicios externos
│   │   ├── sockets/         # Servidor y eventos Socket.IO
│   │   └── database/        # Conexión MongoDB Atlas
│   ├── tests/               # Pruebas unitarias e integradas con Jest
│   └── index.ts             # Entry point principal
```

---

## 🚀 Funcionalidades principales

✅ Creación automática de un plan DCA base desde `.env` (vía `DCAInitService`)
✅ Ejecución periódica de planes activos con `node-cron`
✅ Integración con **1inch API** para simular swaps reales en Polygon
✅ Persistencia en **MongoDB Atlas** (planes, ejecuciones, wallets)
✅ Emisión de eventos en tiempo real con **Socket.IO** (`dca:executed`, `wallet:created`, etc.)
✅ Documentación automática con **Swagger** (`/docs`)
✅ Pruebas unitarias e integradas con **Jest + ts-jest**

---

## ⚙️ Instalación y configuración

### 1️⃣ Clonar el proyecto
```bash
git clone https://github.com/joseberna/dca-0x-lab.git
cd dca-0x-lab/backend
```

### 2️⃣ Instalar dependencias
```bash
yarn install
```

### 3️⃣ Configurar entorno `.env`
Ejemplo:
```env
PORT=4000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dca-lab
CHAIN_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=0x<PRIVATE_KEY>

# Plan DCA inicial
dca_wallet=0x8B2733Ea0AaD06Cb02307B1aa0c88385dd037BB0
DCA_BUDGET_USDC=100
DCA_TOTAL_OPERATIONS=4
DCA_INTERVAL_DAYS=7
DCA_TOKEN_FROM=USDC
DCA_TOKEN_TO=WBTC

# 1inch API
ONEINCH_API_BASE=https://api.1inch.dev/swap/v6.0/137
ONEINCH_API_KEY=<API_KEY>

# Tokens mock en Polygon
SC_USDC_POLYGON=0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
MOCK_WBTC_ADDRESS=0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6
```

### 4️⃣ Ejecutar en desarrollo
```bash
yarn dev
```

Servidor en: **http://localhost:4000**  
Swagger docs: **http://localhost:4000/docs**

---

## 🧠 Endpoints disponibles (Swagger)

| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| `POST` | `/api/wallets` | Crea o recupera una wallet |
| `GET`  | `/api/wallets` | Lista todas las wallets registradas |
| `DELETE` | `/api/wallets/:address` | Elimina una wallet |
| `POST` | `/api/dca` | Crea un nuevo plan DCA |
| `GET`  | `/api/dca/wallet/:walletAddress` | Obtiene todos los planes DCA de una wallet |
| `GET`  | `/api/dca/:planId` | Detalle de un plan DCA |
| `PUT`  | `/api/dca/:planId` | Actualiza un plan |
| `DELETE` | `/api/dca/:planId` | Elimina un plan DCA |
| `GET`  | `/api/dca/:planId/executions` | Obtiene las ejecuciones de un plan |
| `POST` | `/api/dca/execute` | Ejecuta manualmente todos los planes activos |

---

## 🔄 Eventos en tiempo real (Socket.IO)

| Evento | Emisor | Descripción |
|---------|---------|-------------|
| `wallet:created` | `wallet.controller.ts` | Nueva wallet registrada |
| `wallet:deleted` | `wallet.controller.ts` | Wallet eliminada |
| `dca:executed` | `DCAService.ts` | Un plan DCA fue ejecutado exitosamente |

### Escuchar desde el frontend:
```js
const socket = io("http://localhost:4000");

socket.on("connect", () => console.log("✅ Conectado al backend DCA"));
socket.on("wallet:created", data => console.log("Nueva wallet:", data));
socket.on("dca:executed", data => console.log("DCA ejecutado:", data));
```

---

## 🧪 Pruebas

Ejecutar las pruebas unitarias e integradas:
```bash
yarn jest --runInBand --verbose
```

Todas las pruebas se ubican en `/tests/`:
- `unit/` → Lógica individual (1inch, DCAService, etc.)
- `integration/` → Flujos completos (createPlan, sendTransaction)

---

## 📡 Cron Job de ejecución automática

El backend ejecuta el chequeo cada 30 segundos:
```ts
nodeCron.schedule("*/30 * * * * *", async () => {
  logger.info("⏱ Running scheduled DCA check...");
  const dcaService = new DCAService();
  await dcaService.executePlans();
});
```

Esto valida si el intervalo del plan se ha cumplido y ejecuta el swap vía 1inch.

---

## 🧱 Tecnologías principales

| Componente | Tecnología |
|-------------|-------------|
| Runtime | Node.js 22 + ts-node ESM |
| Lenguaje | TypeScript |
| Framework web | Express.js |
| Base de datos | MongoDB Atlas + Mongoose |
| Blockchain | ethers.js + 1inch API (Polygon) |
| WebSockets | Socket.IO |
| Scheduler | node-cron |
| Testing | Jest + ts-jest |
| Documentación | Swagger (OAS 3.0) |

---

## 👨‍💻 Desarrollador
**José Fernando Berna**  
Blockchain Engineer & Full Stack Developer  
📍 Cali, Colombia  
🔗 [linkedin.com/in/josefberna](https://linkedin.com/in/josefberna)

---

## 🧭 Próximos pasos

✅ Integrar el frontend (React / Next.js) con sockets para monitoreo en tiempo real  
✅ Dashboard para visualizar ejecuciones DCA, wallets activas y swaps confirmados  
✅ Migración de cron local → AWS EventBridge / Lambda Scheduler para producción  
✅ Integración de wallets Web3 (Metamask / WalletConnect)

---

> 💡 Este backend fue diseñado con enfoque **escalable, modular y extensible**, preparado para integrarse con un frontend en tiempo real y futuras expansiones DeFi (staking, yield farming, etc.).

