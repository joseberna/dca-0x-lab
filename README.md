# 💎 DedlyFi - Dollar Cost Averaging on Blockchain

![DedlyFi Logo](./frontend-app/public/dedlyfi-logo.png)

**DedlyFi** is a decentralized Dollar Cost Averaging (DCA) platform that enables users to automate their cryptocurrency investments on Polygon and Ethereum Sepolia testnets.

[![CI/CD](https://github.com/joseberna/dca-0x-lab/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/joseberna/dca-0x-lab/actions)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)](https://dedlyfi.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple)](https://api.dedlyfi.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🌟 Features

- ✅ **Automated DCA**: Set up recurring crypto purchases with custom intervals
- ✅ **Non-Custodial**: Your keys, your crypto - always
- ✅ **Multi-Token Support**: WBTC, WETH, and more
- ✅ **Real-time Tracking**: Monitor your plans and executions live
- ✅ **Multi-language**: English, Spanish, and Portuguese
- ✅ **Professional UI**: Premium design with glassmorphism and gradients
- ✅ **Mobile Responsive**: Works seamlessly on all devices

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
│   Vercel        │
└────────┬────────┘
         │
         │ REST API
         │
┌────────▼────────┐      ┌──────────────┐
│   Backend       │◄─────┤   MongoDB    │
│   (Express)     │      │   Atlas      │
│   Railway       │      └──────────────┘
└────────┬────────┘
         │
         │ Web3
         │
┌────────▼────────┐
│   Blockchain    │
│   Polygon       │
│   Sepolia       │
└─────────────────┘
```

## 📦 Monorepo Structure

```
dca-0x-lab/
├── frontend-app/          # Next.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── i18n/
│   ├── public/
│   ├── vitest.config.ts
│   └── README.md
│
├── backend/               # Express backend
│   ├── src/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infraestructure/
│   │   └── config/
│   ├── jest.config.js
│   └── README.md
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml     # CI/CD pipeline
│
├── DEPLOYMENT_STRATEGY.md
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Yarn
- MongoDB
- Redis (for backend jobs)
- MetaMask or compatible wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/joseberna/dca-0x-lab.git
cd dca-0x-lab

# Install frontend dependencies
cd frontend-app
yarn install
cp .env.example .env.local
# Edit .env.local with your values

# Install backend dependencies
cd ../backend
yarn install
cp .env.example .env
# Edit .env with your values

# Start development servers
yarn dev:frontend  # In one terminal
yarn dev:backend   # In another terminal
```

### Environment Setup

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_RPC_URL=your_polygon_rpc_url
NEXT_PUBLIC_RPC_URL_SEPOLIA=your_sepolia_rpc_url
```

#### Backend (`.env`)
```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/dca-prod
RPC_URL=your_polygon_rpc_url
PRIVATE_KEY=your_wallet_private_key
DCA_ACCOUNTING_ADDRESS=0x...
REDIS_HOST=localhost
```

## 🧪 Testing

```bash
# Frontend tests
cd frontend-app
yarn test          # Watch mode
yarn test:ci       # CI mode with coverage

# Backend tests
cd backend
yarn test          # All tests
yarn test:ci       # CI mode with coverage
```

## 🚢 Deployment

### Automated Deployment (CI/CD)

The project uses GitHub Actions for automated deployment:

1. **Push to `develop`**: Runs tests
2. **Tests pass**: Auto-merges to `main`
3. **Push to `main`**: Deploys to production

### Manual Deployment

#### Frontend (Vercel)
```bash
cd frontend-app
vercel --prod
```

#### Backend (Railway)
```bash
cd backend
railway up
```

## 📊 Tech Stack

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi v2, Viem, RainbowKit
- **State**: Zustand
- **Testing**: Vitest + React Testing Library

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose)
- **Queue**: BullMQ + Redis
- **Blockchain**: Ethers.js v6, Viem
- **Testing**: Jest + Supertest

### Infrastructure
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Database**: MongoDB Atlas
- **CI/CD**: GitHub Actions

## 🔐 Security

- ✅ Non-custodial architecture
- ✅ Environment variables for secrets
- ✅ Input validation
- ✅ CORS configuration
- ✅ Error handling
- ✅ Secure smart contract interactions

## 📈 Roadmap

- [ ] Multi-chain support (Arbitrum, Optimism)
- [ ] Advanced DCA strategies (grid, TWAP)
- [ ] Portfolio analytics
- [ ] Mobile app (React Native)
- [ ] DAO governance
- [ ] Yield optimization

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request to `develop`

### Commit Convention
We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [https://dca-0x-lab.vercel.app/](https://dca-0x-lab.vercel.app/)
- **API Docs**: [https://dca-0x-lab-prod.up.railway.app/docs/](https://dca-0x-lab-prod.up.railway.app/docs/)

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/joseberna/dca-0x-lab/)
- **Email**: joseberna@gmail.com

## 👥 Team

- **Jose Berna** - Full Stack Developer & Blockchain Engineer

## 🙏 Acknowledgments

- [0x Protocol](https://0x.org/) for DEX aggregation
- [Uniswap](https://uniswap.org/) for liquidity
- [RainbowKit](https://www.rainbowkit.com/) for wallet connection
- [Vercel](https://vercel.com/) for frontend hosting
- [Railway](https://railway.app/) for backend hosting

---

**Made with ❤️ by the DedlyFi Team**
