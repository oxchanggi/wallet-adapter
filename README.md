# Phoenix Wallet - Multi-Blockchain Wallet Adapter

A powerful React library for seamlessly connecting to multiple blockchain wallets with a unified interface, featuring simultaneous multi-wallet connections and comprehensive multi-chain support.

## 🏗️ Project Structure

This repository contains two main components:

1. **Demo Application** (Root directory) - A Next.js demo app showcasing the Phoenix Wallet library
2. **Phoenix Wallet Library** (`src/phoenix-wallet/`) - The core wallet adapter library

## 🌟 Features

- **Simultaneous Multi-Wallet Connections**: Connect to multiple wallet extensions at the same time without disconnecting
- **Multi-Chain Support**: Ethereum, Polygon, Arbitrum, Optimism, Base, Solana, and Sui blockchains
- **Multiple Wallet Connectors**: MetaMask, Phantom, Rainbow, OKX, TrustWallet, Binance Wallet, MagicEden, Coinbase, and more
- **Unified Interface**: Consistent API across different wallets and chains
- **React Integration**: Custom hooks and context for seamless React integration
- **TypeScript Support**: Full type definitions for enhanced developer experience
- **Contract Interaction**: Simplified interface for interacting with smart contracts

## 🚀 Quick Start

### Running the Demo App

```bash
# Install dependencies
pnpm install

# Run the development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Open [http://localhost:3000](http://localhost:3000) to view the demo application.

### Using the Library

```bash
# Navigate to the library directory
cd src/phoenix-wallet

# Install dependencies
pnpm install

# Build the library
pnpm build

# Run tests
pnpm test
```

## 📦 Library Installation

```bash
npm install @phoenix-wallet/wallet-adapter
# or
yarn add @phoenix-wallet/wallet-adapter
# or
pnpm add @phoenix-wallet/wallet-adapter
```

## 🎯 Basic Usage

```tsx
import React from 'react';
import {
  WalletProvider,
  MetamaskEvmConnector,
  PhantomEvmConnector,
  SolanaConnector,
  SolanaCluster,
} from '@phoenix-wallet/wallet';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

// Define your dapp metadata
const dappMetadata = {
  name: 'My Web3 App',
  url: 'https://example.com',
};

// Set up your connectors
const connectors = [
  new MetamaskEvmConnector(dappMetadata),
  new PhantomEvmConnector(dappMetadata),
  new SolanaConnector(dappMetadata, new PhantomWalletAdapter(), SolanaCluster.MAINNET),
];

function App() {
  return (
    <WalletProvider connectors={connectors} reconnect="auto">
      <YourApp />
    </WalletProvider>
  );
}
```

## 📂 Repository Structure

```
├── src/
│   ├── app/                    # Demo Next.js application
│   │   ├── page.tsx           # Main demo page
│   │   ├── SimpleWalletConnect.tsx
│   │   ├── ConnectorItem.tsx
│   │   └── wallet-config.ts
│   ├── phoenix-wallet/         # Core library
│   │   ├── chains/            # Blockchain configurations
│   │   ├── connectors/        # Wallet connectors
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # React hooks
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Utility functions
│   │   └── wallets/           # Wallet implementations
│   ├── contracts/             # Smart contract interactions
│   └── hooks/                 # Demo app hooks
├── public/                    # Static assets
├── SUI_CONNECTOR_IMPLEMENTATION_GUIDE.md
├── SUI_ECOSYSTEM_RESEARCH.md
└── README.md
```

## 🔗 Supported Blockchains

- **Ethereum & EVM Chains**: Ethereum, Polygon, Arbitrum, Optimism, Base
- **Solana**: Mainnet Beta, Devnet, Testnet
- **Sui**: Mainnet, Testnet, Devnet (In development)

## 💼 Supported Wallets

- **EVM Wallets**: MetaMask, Rainbow, OKX, TrustWallet, Binance Wallet, Coinbase
- **Solana Wallets**: Phantom, Solflare, Backpack, MagicEden
- **Sui Wallets**: Suiet, Slush (In development)

## 📚 Documentation

- **Library Documentation**: See `src/phoenix-wallet/README.md` for comprehensive library usage
- **Demo App**: The Next.js demo app demonstrates all features and usage patterns
- **Implementation Guides**: Check `SUI_CONNECTOR_IMPLEMENTATION_GUIDE.md` for Sui integration details

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- pnpm (recommended package manager)

### Development Setup

```bash
# Clone the repository
git clone [your-repo-url]
cd wallet-adapter

# Install dependencies
pnpm install

# Run the demo app in development mode
pnpm dev

# Work on the library
cd src/phoenix-wallet
pnpm install
pnpm build
```

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](src/phoenix-wallet/LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, please create an issue in the GitHub repository or reach out to the development team.

---

**Demo Application**: [Live Demo](https://phoenix-wallet-adapter-demo.pages.dev/)
**Library Documentation**: [Full Documentation](src/phoenix-wallet/README.md)
