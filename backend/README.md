# 💸 DCA 0x Lab Backend

Backend robusto y escalable desarrollado en **Node.js + TypeScript** para gestionar y automatizar planes DCA (Dollar Cost Averaging) en redes EVM (Sepolia, Polygon).

Cuenta con una arquitectura orientada a eventos, colas de tareas distribuidas con **Redis + BullMQ**, persistencia en **MongoDB**, y trazabilidad completa on-chain y off-chain.

---

## 🧩 Arquitectura

El sistema sigue una estructura **Clean Architecture** y **Hexagonal**, separando responsabilidades:

```
backend/
├── src/
│   ├── application/         # Casos de uso y servicios (DCAService, TreasuryService)
│   ├── config/              # Configuración (Logger, Redis, Swagger, Networks)
│   ├── domain/              # Entidades, modelos y repositorios
│   │   ├── models/          # Esquemas Mongoose (DCAPlan, DCAExecution)
│   │   └── repositories/    # Abstracción de datos
│   ├── infraestructure/     # Adaptadores externos
│   │   ├── api/             # API REST (Express) + Controladores
│   │   ├── blockchain/      # Interacción con Smart Contracts (Ethers.js)
│   │   ├── database/        # Conexión MongoDB Atlas
│   │   ├── jobs/            # Sistema de colas y workers (BullMQ)
│   │   │   ├── queues/      # Definición de colas
│   │   │   ├── scheduler/   # Cron jobs y planificadores
│   │   │   └── workers/     # Procesadores de tareas en segundo plano
│   │   └── sockets/         # Eventos en tiempo real (Socket.IO)
│   └── __tests__/           # Pruebas unitarias e integradas (Jest)
```

---

## 🚀 Funcionalidades Principales

✅ **Gestión de Planes DCA**: Creación, pausa, cancelación y consulta de planes.
✅ **Ejecución Distribuida**: Uso de **BullMQ + Redis Cloud** para procesar ejecuciones de manera fiable y escalable.
✅ **Trazabilidad Completa**: Registro detallado de cada "tick" (ejecución) tanto en DB como en Blockchain.
✅ **Panel de Administración**: Endpoints específicos para monitoreo global de planes y ejecuciones.
✅ **Tesorería Automatizada**: Bots (`TreasuryService`) que monitorean y recargan liquidez automáticamente.
✅ **Multi-Network**: Soporte configurado para Sepolia y Polygon.
✅ **Documentación API**: Swagger UI integrado.

---

## ⚙️ Instalación y Configuración

### 1️⃣ Prerrequisitos
- Node.js v18+
- Yarn
- MongoDB Atlas (o local)
- Redis Cloud (o local)

### 2️⃣ Instalación
```bash
cd backend
yarn install
```

### 3️⃣ Variables de Entorno (.env)
Crea un archivo `.env` en la raíz de `backend/` con las siguientes variables:

```env
# ⚙️ Servidor
PORT=4000
SCHEDULER_INTERVAL=60000

# 🔐 Base de Datos
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/dca-prod
REDIS_URL=redis://default:<pass>@<host>:<port>

# 🌐 Blockchain (Sepolia / Polygon)
ACTIVE_NETWORK=sepolia
RPC_URL_SEPOLIA=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
RPC_URL_POLYGON=https://polygon-rpc.com

# 🔑 Private Keys (Admin & Treasury)
PRIVATE_KEY=0x...
TREASURY_PRIVATE_KEY=0x...

# 📍 Smart Contracts (Actualizados)
SEPOLIA_ACCOUNTING=0x...
SEPOLIA_REGISTRY=0x...
```

### 4️⃣ Ejecutar en Desarrollo
```bash
yarn dev
```
El servidor iniciará en `http://localhost:4000`.

---

## 📚 Documentación API (Swagger)

Una vez iniciado el servidor, visita:
👉 **http://localhost:4000/docs**

### Endpoints Clave:

#### 👮 Admin (Trazabilidad)
- `GET /api/dca/admin/plans`: Listar todos los planes (paginado).
- `GET /api/dca/admin/executions`: Ver historial global de ejecuciones.
- `GET /api/dca/admin/plans/{planId}`: Detalle profundo de un plan.

#### 👤 Usuario
- `GET /api/dca/my-plans/{userAddress}`: Ver mis planes.
- `GET /api/dca/my-executions/{userAddress}`: Ver mi historial.

#### ⚙️ Core
- `POST /api/dca/create-on-chain`: Crear nuevo plan DCA.
- `PUT /api/dca/{planId}`: Pausar/Reanudar plan.

---

## 🧪 Testing

El proyecto cuenta con una suite de pruebas unitarias usando **Jest**.

```bash
# Ejecutar todos los tests
yarn test

# Ejecutar tests específicos
yarn jest src/__tests__/controllers/DCAAdminController.test.ts
```

---

## 🛠 Stack Tecnológico

- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **DB**: MongoDB (Mongoose)
- **Queue**: BullMQ + Redis
- **Blockchain**: Ethers.js v5
- **Testing**: Jest
- **Docs**: Swagger (OpenAPI 3.0)

---

## 👨‍💻 Desarrollador

**José Fernando Berna**
*Blockchain Engineer & Full Stack Developer*
