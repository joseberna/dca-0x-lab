# ⚡ DedlyFi Backend

High-performance backend API for DedlyFi Dollar Cost Averaging platform with blockchain integration, automated execution, and real-time updates.

## 🚀 Features

- ✅ **DCA Plan Management**: Create, read, update, and delete DCA plans
- ✅ **Automated Execution**: BullMQ job queue for scheduled plan execution
- ✅ **Blockchain Integration**: Ethers.js v6 + Viem for smart contract interaction
- ✅ **Real-time Updates**: Socket.io for live plan status
- ✅ **MongoDB Storage**: Persistent plan and execution data
- ✅ **Redis Queue**: Reliable job scheduling and processing
- ✅ **API Documentation**: Swagger/OpenAPI docs
- ✅ **Admin Dashboard**: Bull Board for queue monitoring

## 🛠️ Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Queue**: BullMQ + Redis
- **Blockchain**: Ethers.js v6, Viem
- **Real-time**: Socket.io
- **Testing**: Jest + Supertest
- **Documentation**: Swagger

## 📦 Installation

```bash
# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env

# Start development server
yarn dev
```

## 🔧 Environment Variables

Create a `.env` file:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/dca-prod

# Blockchain
RPC_URL=your_polygon_rpc_url
RPC_URL_SEPOLIA=your_sepolia_rpc_url
PRIVATE_KEY=your_wallet_private_key

# Contracts
DCA_ACCOUNTING_ADDRESS=0x...
USDC_ADDRESS=0x...
WBTC_ADDRESS=0x...
WETH_ADDRESS=0x...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API Keys
ZERO_X_API_KEY=your_0x_api_key
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:ci

# Run specific test
yarn test dcaPlan.repository.test.ts
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── application/
│   │   └── services/
│   │       ├── DCAService.ts
│   │       └── ExecutionService.ts
│   ├── domain/
│   │   ├── entities/
│   │   ├── models/
│   │   └── repositories/
│   ├── infraestructure/
│   │   ├── api/
│   │   │   ├── controllers/
│   │   │   └── routes/
│   │   ├── blockchain/
│   │   │   └── scripts/
│   │   ├── jobs/
│   │   │   ├── dcaExecutor.job.ts
│   │   │   └── treasurySwap.job.ts
│   │   └── sockets/
│   ├── config/
│   │   ├── database.ts
│   │   ├── logger.ts
│   │   └── redis.ts
│   └── index.ts
├── __tests__/
│   └── dcaPlan.repository.test.ts
├── jest.config.js
└── package.json
```

## 🔌 API Endpoints

### DCA Plans

```http
# Create plan on-chain
POST /api/dca/create-on-chain
Content-Type: application/json

{
  "userAddress": "0x...",
  "toToken": "WBTC",
  "totalAmount": 100,
  "amountPerInterval": 50,
  "intervalSeconds": 86400,
  "totalOperations": 2
}

# Get user plans
GET /api/dca/my-plans/:userAddress

# Get plan details (with executions)
GET /api/dca/my-plans/:userAddress/:planId

# Sync plan from transaction
POST /api/dca/sync
Content-Type: application/json

{
  "txHash": "0x..."
}
```

### Admin Endpoints

```http
# Get all plans (paginated)
GET /api/dca/admin/plans?page=1&limit=10&status=active

# Get plan details
GET /api/dca/admin/plans/:planId

# Get all executions
GET /api/dca/admin/executions?page=1&limit=10
```

## 🔄 Job Queue

### DCA Executor Job
- **Schedule**: Every 5 minutes
- **Function**: Check and execute pending DCA plans
- **Retry**: 3 attempts with exponential backoff

### Treasury Swap Job
- **Schedule**: Every hour
- **Function**: Swap accumulated USDC to WBTC/WETH
- **Retry**: 2 attempts

### Monitoring
Access Bull Board at: `http://localhost:4000/admin/queues`

## 🗄️ Database Schema

### DCAPlan
```typescript
{
  userAddress: string;
  contractId: number;
  network: string;
  tokenFrom: string;
  tokenTo: string;
  totalAmount: number;
  amountPerInterval: number;
  intervalSeconds: number;
  totalOperations: number;
  executedOperations: number;
  lastExecution: Date;
  nextExecution: Date;
  status: 'active' | 'paused' | 'completed' | 'failed';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### DCAExecution
```typescript
{
  planId: ObjectId;
  userAddress: string;
  txHash: string;
  amount: number;
  tokenFrom: string;
  tokenTo: string;
  status: 'success' | 'failed' | 'pending';
  executedAt: Date;
  errorMessage?: string;
}
```

## 🚢 Deployment

### Railway (Recommended)

1. Connect your GitHub repository to Railway
2. Configure environment variables
3. Deploy automatically on push to `main`

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Environment Variables in Railway
- All variables from `.env`
- `MONGODB_URI` (use MongoDB Atlas connection string)
- `REDIS_URL` (Railway provides this automatically)

### Health Check
```http
GET /health
```

## 📊 Monitoring

### Logs
```bash
# View logs in Railway dashboard
railway logs

# Or use Winston logger
# Logs are stored in logs/ directory
```

### Metrics
- Request count
- Response time
- Error rate
- Queue length
- Job success/failure rate

## 🔐 Security

- ✅ CORS configured
- ✅ Environment variables for secrets
- ✅ Input validation
- ✅ Error handling
- ✅ Rate limiting (TODO)
- ✅ API key authentication (TODO)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request to `develop`

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- **API Docs**: [https://api.dedlyfi.com/docs](https://api.dedlyfi.com/docs)
- **Frontend**: [https://dedlyfi.vercel.app](https://dedlyfi.vercel.app)
- **Status Page**: [https://status.dedlyfi.com](https://status.dedlyfi.com)

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@dedlyfi.com
