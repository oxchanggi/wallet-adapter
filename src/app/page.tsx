'use client';
import { ChainType, WalletProvider } from "../phoenix-wallet";
import { SimpleWalletConnect } from "./SimpleWalletConnect";
import { MetamaskEvmConnector, PhantomEvmConnector } from "../phoenix-wallet";

const dappMetadata = {
  name: "Phoenix Wallet",
  url: "https://phoenix-wallet.com",
};

export const defaultConnectors = [
  new MetamaskEvmConnector(dappMetadata),
  new PhantomEvmConnector(dappMetadata),
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
  }
]


export default function Home() {
  return (
    <WalletProvider connectors={defaultConnectors} chainConfigs={chainConfigs} reconnect="auto">
      <SimpleWalletConnect />
    </WalletProvider>
  );
}
