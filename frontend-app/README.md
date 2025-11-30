# 🎨 DedlyFi Frontend

Modern, responsive frontend for DedlyFi Dollar Cost Averaging platform built with Next.js, TypeScript, and Web3 technologies.

## 🚀 Features

- ✅ **DCA Plan Creation**: Create automated DCA plans with custom parameters
- ✅ **Plan Management**: View and manage your active DCA plans
- ✅ **Execution History**: Track all plan executions with detailed transaction data
- ✅ **Multi-language Support**: English, Spanish, and Portuguese
- ✅ **Wallet Integration**: RainbowKit + Wagmi v2 for seamless Web3 connectivity
- ✅ **Real-time Updates**: Socket.io integration for live plan status
- ✅ **Toast Notifications**: Professional, internationalized notifications
- ✅ **Responsive Design**: Premium UI with glassmorphism and gradients

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi v2, Viem, RainbowKit
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Real-time**: Socket.io Client

## 📦 Installation

```bash
# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env.local

# Start development server
yarn dev
```

## 🔧 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_RPC_URL=your_polygon_rpc_url
NEXT_PUBLIC_RPC_URL_SEPOLIA=your_sepolia_rpc_url
```

## 🧪 Testing

```bash
# Run tests in watch mode
yarn test

# Run tests with UI
yarn test:ui

# Run tests for CI (with coverage)
yarn test:ci

# Run tests in watch mode
yarn test:watch
```

## 📁 Project Structure

```
frontend-app/
├── public/              # Static assets
│   ├── dedlyfi-logo.png
│   └── favicon.ico
├── src/
│   ├── components/      # React components
│   │   ├── DynamicNavbar.tsx
│   │   ├── DCAPlanForm.tsx
│   │   ├── Toast.tsx
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   │   └── useToast.ts
│   ├── i18n/            # Internationalization
│   │   ├── en.ts
│   │   ├── es.ts
│   │   └── pt.ts
│   ├── pages/           # Next.js pages
│   │   ├── index.tsx
│   │   ├── plans.tsx
│   │   └── plans/[id].tsx
│   ├── store/           # Zustand stores
│   │   ├── useDCAStore.ts
│   │   ├── useLangStore.ts
│   │   └── useToastStore.ts
│   ├── styles/          # Global styles
│   │   └── globals.css
│   ├── tests/           # Test files
│   │   ├── setup.ts
│   │   ├── Toast.test.tsx
│   │   └── ...
│   └── utils/           # Utility functions
│       ├── contracts.ts
│       ├── logger.ts
│       └── ...
├── vitest.config.ts     # Vitest configuration
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: `#00d4ff` (Cyan)
- **Accent**: `#0ea5e9` (Sky Blue)
- **Background**: `#0a0e1a` (Dark Navy)
- **Secondary**: `#1e293b` (Slate)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, gradient text
- **Body**: Regular, high contrast

### Components
- **Glass Effect**: `backdrop-blur-xl` with semi-transparent backgrounds
- **Gradients**: Linear gradients from primary to accent
- **Shadows**: Soft glows with primary color
- **Animations**: Smooth transitions and hover effects

## 🔗 Key Components

### DynamicNavbar
Unified navigation bar with support for:
- Logo and branding
- Breadcrumbs
- Dynamic actions
- Language selector
- Wallet connection

### DCAPlanForm
Form for creating DCA plans with:
- Token selection
- Budget input
- Division configuration
- Interval settings
- Approval flow
- Transaction handling

### Toast System
Professional notification system with:
- 4 types: success, error, warning, info
- Auto-dismiss
- Custom duration
- Internationalized messages
- Smooth animations

## 🌐 Internationalization

The app supports 3 languages:
- 🇬🇧 English (`en`)
- 🇪🇸 Spanish (`es`)
- 🇧🇷 Portuguese (`pt`)

All UI text is centralized in `src/i18n/` files.

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to `main`

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables in Vercel
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_WC_PROJECT_ID`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_RPC_URL_SEPOLIA`

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: Optimized with Next.js automatic code splitting
- **Loading Time**: < 2s on 3G networks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request to `develop`

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live Demo**: [https://dedlyfi.vercel.app](https://dedlyfi.vercel.app)
- **Backend API**: [https://api.dedlyfi.com](https://api.dedlyfi.com)
- **Documentation**: [https://docs.dedlyfi.com](https://docs.dedlyfi.com)

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@dedlyfi.com
