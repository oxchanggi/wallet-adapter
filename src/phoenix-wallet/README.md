# Phoenix Wallet

A React library for connecting to multiple blockchain wallets with a unified interface.

## Features

- Multi-chain support (Ethereum, Polygon, BSC, Arbitrum, Optimism, Base, Solana)
- Unified wallet interface for different blockchains
- Built-in React hooks and components
- TypeScript support

## Installation

```bash
npm install @phoenix-wallet/wallet
# or
yarn add @phoenix-wallet/wallet
```

## Quick Start

```tsx
import React from 'react';
import { 
  WalletProvider, 
  WalletConnectButton, 
  defaultConnectors 
} from '@phoenix-wallet/wallet';

function App() {
  return (
    <WalletProvider connectors={defaultConnectors}>
      <div className="app">
        <header>
          <h1>My Web3 App</h1>
          <WalletConnectButton />
        </header>
        <main>
          {/* Your app content */}
        </main>
      </div>
    </WalletProvider>
  );
}

export default App;
```

## Using the Wallet Hook

```tsx
import { useWallet } from '@phoenix-wallet/wallet';

function MyComponent() {
  const { 
    wallet, 
    isConnected, 
    isConnecting, 
    connect, 
    disconnect, 
    error 
  } = useWallet();

  const handleSignMessage = async () => {
    if (wallet) {
      try {
        const signature = await wallet.signMessage('Hello, Web3!');
        console.log('Signature:', signature);
      } catch (error) {
        console.error('Error signing message:', error);
      }
    }
  };

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {wallet?.address}</p>
          <p>Chain: {wallet?.chain}</p>
          <button onClick={handleSignMessage}>Sign Message</button>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <div>
          <p>Not connected</p>
          <button 
            onClick={() => connect('metamask')} 
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
```

## Custom Connectors

You can create and use your own wallet connectors:

```tsx
import { 
  WalletProvider, 
  EvmConnector, 
  SolanaConnector, 
  Chain 
} from '@phoenix-wallet/wallet';

// Create custom connectors
const myConnectors = [
  new EvmConnector('coinbase', {
    name: 'Coinbase Wallet',
    chains: [Chain.ETHEREUM, Chain.POLYGON],
  }),
  // Add more connectors as needed
];

function App() {
  return (
    <WalletProvider connectors={myConnectors}>
      {/* Your app components */}
    </WalletProvider>
  );
}
```

## License

MIT 