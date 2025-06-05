"use client";

import {
  BinanceEvmConnector,
  ChainType,
  // MagicEdenEvmConnector,
  // MetamaskEvmConnector,
  // PhantomEvmConnector,
  // RainbowEvmConnector,
  // TrustWalletEvmConnector,
  WalletProvider,
} from "../phoenix-wallet";
import { SimpleWalletConnect } from "./SimpleWalletConnect";

const dappMetadata = {
  name: "Phoenix Wallet",
  url: "https://phoenix-wallet.com",
};

export const defaultConnectors = [
  // new MetamaskEvmConnector(dappMetadata),
  // new PhantomEvmConnector(dappMetadata),
  // new TrustWalletEvmConnector(dappMetadata),
  // new MagicEdenEvmConnector(dappMetadata),
  // new RainbowEvmConnector(dappMetadata),
  new BinanceEvmConnector(dappMetadata),
]

export const chainConfigs = [
  {
    id: "1",
    name: "Ethereum",
    publicRpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    privateRpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    explorerUrl: "https://etherscan.io",
    chainId: 1,
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    chainType: ChainType.EVM,
  },
  {
    id: "137",
    name: "Polygon",
    publicRpcUrl: "https://polygon-rpc.com",
    privateRpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    chainId: 137,
    nativeCurrency: { name: "Polygon", symbol: "MATIC", decimals: 18 },
    chainType: ChainType.EVM,
  },
  {
    id: "11155111",
    name: "Sepolia",
    publicRpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    privateRpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    explorerUrl: "https://sepolia.etherscan.io",
    chainId: 11155111,
    nativeCurrency: { name: "Sepolia", symbol: "ETH", decimals: 18 },
    chainType: ChainType.EVM,
  },
  {
    id: "56",
    name: "BSC",
    publicRpcUrl: "https://bsc-dataseed.binance.org",
    privateRpcUrl: "https://bsc-dataseed.binance.org",
    explorerUrl: "https://bscscan.com",
    chainId: 56,
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    chainType: ChainType.EVM,
  },
];

export default function Home() {
  return (
    <WalletProvider
      connectors={defaultConnectors}
      chainConfigs={chainConfigs}
      reconnect="auto"
    >
      <SimpleWalletConnect />
    </WalletProvider>
  );
}
