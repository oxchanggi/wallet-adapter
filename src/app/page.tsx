'use client';

import { RabbyEvmConnector } from '@/phoenix-wallet/connectors/evm/RabbyEvmConnector';
import {
  BinanceEvmConnector,
  ChainType,
  MagicEdenEvmConnector,
  RainbowEvmConnector,
  TrustWalletEvmConnector,
  OkxEvmConnector,
  WalletProvider,
  SolanaConnector,
  MetamaskEvmConnector,
  PhantomEvmConnector,
  PhantomSuiConnector,
  SolanaCluster,
} from '../phoenix-wallet';
import { SimpleWalletConnect } from './SimpleWalletConnect';
import { CoinbaseEvmConnector } from '@/phoenix-wallet/connectors/evm/CoinbaseEvmConnector';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
const dappMetadata = {
  name: 'Phoenix Wallet',
  url: 'https://phoenix-wallet.com',
};

export const defaultConnectors = [
  new MetamaskEvmConnector(dappMetadata),
  new PhantomEvmConnector(dappMetadata),
  new CoinbaseEvmConnector(dappMetadata),
  new TrustWalletEvmConnector(dappMetadata),
  new MagicEdenEvmConnector(dappMetadata),
  new RainbowEvmConnector(dappMetadata),
  new RabbyEvmConnector(dappMetadata),
  new OkxEvmConnector(dappMetadata),
  new BinanceEvmConnector(dappMetadata),
  new PhantomSuiConnector(dappMetadata),

  // Solana
  new SolanaConnector(dappMetadata, new PhantomWalletAdapter(), SolanaCluster.DEVNET),
];

export const chainConfigs = [
  {
    id: '1',
    name: 'Ethereum',
    publicRpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    privateRpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
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
    id: '11155111',
    name: 'Sepolia',
    publicRpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    privateRpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://sepolia.etherscan.io',
    chainId: 11155111,
    nativeCurrency: { name: 'Sepolia', symbol: 'ETH', decimals: 18 },
    chainType: ChainType.EVM,
  },
  {
    id: '56',
    name: 'BSC',
    publicRpcUrl: 'https://bsc-dataseed.binance.org',
    privateRpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    chainId: 56,
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    chainType: ChainType.EVM,
  },
  {
    id: "sui:mainnet",
    name: "Sui Mainnet",
    publicRpcUrl: "https://fullnode.mainnet.sui.io:443",
    privateRpcUrl: "https://fullnode.mainnet.sui.io:443",
    explorerUrl: "https://suivision.xyz",
    chainId: "sui:mainnet" as any,
    nativeCurrency: { name: "Sui", symbol: "SUI", decimals: 18 },
    chainType: ChainType.SUI,
  },
  {
    id: 'solana_devnet',
    name: 'Solana',
    publicRpcUrl: 'https://api.devnet.solana.com',
    privateRpcUrl: 'https://api.devnet.solana.com',
    explorerUrl: 'https://explorer.solana.com',
    chainId: -1111,
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    chainType: ChainType.SOLANA,
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

export default function Home() {
  return (
    <WalletProvider connectors={defaultConnectors} chainConfigs={chainConfigs} reconnect="auto">
      <SimpleWalletConnect />
    </WalletProvider>
  );
}
