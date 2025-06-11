import {
  BinanceEvmConnector,
  ChainType,
  MagicEdenEvmConnector,
  MetamaskEvmConnector,
  PhantomEvmConnector,
  RainbowEvmConnector,
  TrustWalletEvmConnector,
  OkxEvmConnector,
  SolanaConnector,
  SolanaCluster,
  CoinbaseEvmConnector,
  RabbyEvmConnector,
  PhantomSuiConnector,
} from '@phoenix-wallet/wallet-adapter';
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

  // Solana
  new SolanaConnector(dappMetadata, new PhantomWalletAdapter(), SolanaCluster.DEVNET),

  // Sui
  new PhantomSuiConnector(dappMetadata),
];

export const chainConfigs = [
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
    id: '11155111',
    name: 'Sepolia',
    publicRpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
    privateRpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
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
  // sui mainnet
  {
    id: 'sui:mainnet',
    name: 'Sui',
    publicRpcUrl: 'https://fullnode.mainnet.sui.io:443',
    privateRpcUrl: 'https://fullnode.mainnet.sui.io:443',
    explorerUrl: 'https://suiscan.io',
    chainId: 646,
    nativeCurrency: { name: 'Sui', symbol: 'SUI', decimals: 9 },
    chainType: ChainType.SUI,
  },
];
