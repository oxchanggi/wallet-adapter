# Phoenix Wallet

A powerful React library for seamlessly connecting to multiple blockchain wallets with a unified interface.

## Installation

```bash
npm install @phoenix-wallet/wallet-adapter
# or
yarn add @phoenix-wallet/wallet-adapter
# or
pnpm add @phoenix-wallet/wallet-adapter
```

## Why Phoenix Wallet?

### Key Features

- **Simultaneous Multi-Wallet Connections**: Connect to multiple wallet extensions at the same time without disconnecting - the only library that maintains all wallet sessions simultaneously
- **Multi-Chain Support**: Connect to Ethereum, Polygon, Arbitrum, Optimism, Base, Solana, and more
- **Multiple Wallet Connectors**: Support for MetaMask, Phantom, Rainbow, OKX, TrustWallet, Binance Wallet, MagicEden, and Coinbase
- **Unified Interface**: Consistent API across different wallets and chains
- **React Integration**: Custom hooks and context for seamless React integration
- **TypeScript Support**: Full type definitions for enhanced developer experience
- **Contract Interaction**: Simplified interface for interacting with smart contracts

## Quick Start

```tsx
import React from 'react';
import { 
  WalletProvider, 
  MetamaskEvmConnector,
  PhantomEvmConnector,
  SolanaConnector,
  SolanaCluster
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
  // For Solana, you need to provide a wallet adapter
  new SolanaConnector(dappMetadata, new PhantomWalletAdapter(), SolanaCluster.MAINNET),
];

function App() {
  return (
    <WalletProvider connectors={connectors} reconnect="auto">
      <YourApp />
    </WalletProvider>
  );
}

export default App;
```

## Core Concepts

### 1. Simultaneous Multi-Wallet Connections

Unlike other wallet libraries that only allow one active connection at a time, Phoenix Wallet lets you maintain multiple active wallet connections simultaneously:

```tsx
import { useWallet } from '@phoenix-wallet/wallet';

function MultiWalletExample() {
  // Connect to multiple wallets simultaneously
  const metamask = useWallet('metamask');
  const phantom = useWallet('phantomevm');
  const binance = useWallet('binanceevm');
  
  return (
    <div>
      <div className="wallet-section">
        <h3>MetaMask</h3>
        {metamask.isConnected ? (
          <div>
            <p>Connected: {metamask.address}</p>
            <button onClick={metamask.disconnect}>Disconnect MetaMask</button>
          </div>
        ) : (
          <button onClick={metamask.connect}>Connect MetaMask</button>
        )}
      </div>
      
      <div className="wallet-section">
        <h3>Phantom</h3>
        {phantom.isConnected ? (
          <div>
            <p>Connected: {phantom.address}</p>
            <button onClick={phantom.disconnect}>Disconnect Phantom</button>
          </div>
        ) : (
          <button onClick={phantom.connect}>Connect Phantom</button>
        )}
      </div>
      
      {/* All connections are maintained independently */}
      {metamask.isConnected && phantom.isConnected && (
        <div className="cross-chain-actions">
          <h3>Cross-Chain Actions</h3>
          <button onClick={() => performCrossChainAction(metamask.wallet, phantom.wallet)}>
            Perform Cross-Chain Action
          </button>
        </div>
      )}
    </div>
  );
}
```

### 2. Chain Configuration

Configure multiple blockchain networks:

```tsx
import { ChainType, WalletProvider } from '@phoenix-wallet/wallet';

// Define chain configurations
const chainConfigs = [
  {
    id: '1',
    name: 'Ethereum',
    publicRpcUrl: 'https://eth.llamarpc.com',
    privateRpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    chainId: 1,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    chainType: ChainType.EVM,
  },
  {
    id: '137',
    name: 'Polygon',
    publicRpcUrl: 'https://polygon-rpc.com',
    privateRpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    chainId: 137,
    nativeCurrency: { name: 'Polygon', symbol: 'MATIC', decimals: 18 },
    chainType: ChainType.EVM,
  },
  {
    id: 'solana_mainnet_beta',
    name: 'Solana',
    publicRpcUrl: 'https://api.mainnet-beta.solana.com',
    privateRpcUrl: 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    chainId: 101,
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    chainType: ChainType.SOLANA,
  },
];

function App() {
  return (
    <WalletProvider 
      connectors={yourConnectors} 
      chainConfigs={chainConfigs}
      reconnect="auto"
    >
      <YourApp />
    </WalletProvider>
  );
}
```

## Basic Usage

### Connecting a Wallet

```tsx
import { useWallet } from '@phoenix-wallet/wallet';

function WalletConnect() {
  // You need to specify the connector ID
  const { 
    connect, 
    disconnect, 
    wallet, 
    isConnected, 
    isConnecting, 
    address, 
    chainId,
    isInstalled
  } = useWallet('metamask');

  if (isConnected) {
    return (
      <div>
        <p>Connected: {address}</p>
        <p>Chain ID: {chainId}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <button 
      onClick={connect} 
      disabled={isConnecting || isInstalled === false}
    >
      {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
    </button>
  );
}
```

### Switching Chains

```tsx
import { useWallet } from '@phoenix-wallet/wallet';

function ChainSwitcher() {
  const { switchChain, chainId } = useWallet('metamask');
  
  return (
    <div>
      <p>Current Chain: {chainId}</p>
      <button onClick={() => switchChain('0x1')}>Switch to Ethereum Mainnet</button>
      <button onClick={() => switchChain('0x89')}>Switch to Polygon</button>
      <button onClick={() => switchChain('0xa')}>Switch to Optimism</button>
    </div>
  );
}
```

### Checking Wallet Balance

```tsx
import { useWallet } from '@phoenix-wallet/wallet';
import { useEffect, useState } from 'react';

function WalletBalance() {
  const { wallet, isConnected } = useWallet('metamask');
  const [balance, setBalance] = useState(null);
  
  useEffect(() => {
    if (wallet && isConnected) {
      fetchBalance();
    }
  }, [wallet, isConnected]);
  
  const fetchBalance = async () => {
    try {
      const result = await wallet.getBalance();
      setBalance(result);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };
  
  if (!isConnected || !balance) return <p>Connect wallet to see balance</p>;
  
  return (
    <div>
      <p>Balance: {balance.uiAmount} {balance.symbol}</p>
      <button onClick={fetchBalance}>Refresh</button>
    </div>
  );
}
```

## Advanced Features

### Signing Messages and Transactions

```tsx
import { useWallet } from '@phoenix-wallet/wallet';

function SigningExample() {
  const { wallet, isConnected } = useWallet('metamask');
  
  const signMessage = async () => {
    if (!wallet) return;
    
    try {
      const signature = await wallet.signMessage('Hello, Web3!');
      console.log('Message signature:', signature);
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };
  
  const sendTransaction = async () => {
    if (!wallet) return;
    
    try {
      const transaction = {
        to: '0xRecipientAddress',
        value: '0.01', // ETH amount
        data: '0x' // Optional data
      };
      
      const txHash = await wallet.sendTransaction(transaction);
      console.log('Transaction hash:', txHash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };
  
  return (
    <div>
      <button onClick={signMessage} disabled={!isConnected}>
        Sign Message
      </button>
      <button onClick={sendTransaction} disabled={!isConnected}>
        Send Transaction
      </button>
    </div>
  );
}
```

### Working with Smart Contracts

```tsx
import { useWallet, EvmContract, ChainType } from '@phoenix-wallet/wallet';
import { createPublicClient, http } from 'viem';
import { useEffect, useState } from 'react';

// Token contract ABI (for ERC20 tokens)
const tokenAbi = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
];

function TokenInteraction() {
  const { wallet, isConnected } = useWallet('metamask');
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(null);
  
  useEffect(() => {
    if (!isConnected || !wallet) return;
    
    // For EVM chains
    if (wallet.chain.chainType === ChainType.EVM) {
      // Create a public client for the chain
      const publicClient = createPublicClient({
        chain: {
          id: wallet.chain.chainId,
          name: wallet.chain.name,
          nativeCurrency: wallet.chain.nativeCurrency,
          rpcUrls: {
            default: { http: [wallet.chain.privateRpcUrl] },
          },
        },
        transport: http(wallet.chain.privateRpcUrl),
      });
      
      // Create the contract instance
      const contractInstance = new EvmContract(
        publicClient,
        '0xTokenAddress', // Your token contract address
        tokenAbi
      );
      
      // Assign the wallet to the contract to enable write operations
      contractInstance.wallet = wallet;
      
      setContract(contractInstance);
    }
  }, [wallet, isConnected]);
  
  const getBalance = async () => {
    if (!contract || !wallet) return;
    
    try {
      const balanceWei = await contract.contract.read.balanceOf([wallet.address]);
      setBalance(balanceWei.toString());
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };
  
  const sendTokens = async () => {
    if (!contract || !wallet) return;
    
    try {
      const tx = await contract.contract.write.transfer(
        ['0xRecipientAddress', BigInt('1000000000000000000')], // 1 token with 18 decimals
        { account: wallet.address }
      );
      
      // Wait for transaction confirmation
      const receipt = await contract.waitTransaction(tx);
      console.log('Transaction confirmed:', receipt);
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };
  
  return (
    <div>
      <button onClick={getBalance} disabled={!contract}>Get Token Balance</button>
      {balance && <p>Balance: {balance}</p>}
      <button onClick={sendTokens} disabled={!contract}>Send Tokens</button>
    </div>
  );
}
```

## Reference

### Supported Wallet Connectors

- MetaMask (`MetamaskEvmConnector`)
- Phantom EVM (`PhantomEvmConnector`)
- Phantom Solana (`SolanaConnector` with `PhantomWalletAdapter`)
- Rainbow (`RainbowEvmConnector`)
- OKX Wallet (`OkxEvmConnector`)
- TrustWallet (`TrustWalletEvmConnector`)
- Binance Wallet (`BinanceEvmConnector`)
- MagicEden (`MagicEdenEvmConnector`)
- Coinbase (`CoinbaseEvmConnector`)

### Custom Chain Creation

```tsx
import { EvmChain, SolanaChain, ChainType } from '@phoenix-wallet/wallet';

// Create an EVM chain
const ethereumChain = new EvmChain('Ethereum', {
  id: '1',
  name: 'Ethereum',
  publicRpcUrl: 'https://eth.llamarpc.com',
  privateRpcUrl: 'https://eth.llamarpc.com',
  explorerUrl: 'https://etherscan.io',
  chainId: 1,
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  chainType: ChainType.EVM,
});
```

## License

MIT
