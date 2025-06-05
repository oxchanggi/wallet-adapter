import { IChainConfig, ChainType } from "./Chain";

// Sui Mainnet Configuration
export const SUI_MAINNET: IChainConfig = {
  id: "sui-mainnet",
  name: "Sui Mainnet",
  publicRpcUrl: "https://fullnode.mainnet.sui.io:443",
  privateRpcUrl: "https://fullnode.mainnet.sui.io:443",
  explorerUrl: "https://suivision.xyz",
  chainId: 1, // Sui uses string identifiers, but we need number for compatibility
  nativeCurrency: {
    name: "Sui",
    symbol: "SUI",
    decimals: 9,
  },
  chainType: ChainType.SUI,
};

// Sui Testnet Configuration
export const SUI_TESTNET: IChainConfig = {
  id: "sui-testnet",
  name: "Sui Testnet",
  publicRpcUrl: "https://fullnode.testnet.sui.io:443",
  privateRpcUrl: "https://fullnode.testnet.sui.io:443",
  explorerUrl: "https://suivision.xyz/testnet",
  chainId: 2, // Sui uses string identifiers, but we need number for compatibility
  nativeCurrency: {
    name: "Sui",
    symbol: "SUI",
    decimals: 9,
  },
  chainType: ChainType.SUI,
};

// Sui Devnet Configuration
export const SUI_DEVNET: IChainConfig = {
  id: "sui-devnet",
  name: "Sui Devnet",
  publicRpcUrl: "https://fullnode.devnet.sui.io:443",
  privateRpcUrl: "https://fullnode.devnet.sui.io:443",
  explorerUrl: "https://suivision.xyz/devnet",
  chainId: 3, // Sui uses string identifiers, but we need number for compatibility
  nativeCurrency: {
    name: "Sui",
    symbol: "SUI",
    decimals: 9,
  },
  chainType: ChainType.SUI,
};

// Collection of all Sui chains
export const SUI_CHAINS = {
  MAINNET: SUI_MAINNET,
  TESTNET: SUI_TESTNET,
  DEVNET: SUI_DEVNET,
} as const;

// Helper function to get chain config by network type
export function getSuiChainConfig(
  network: "mainnet" | "testnet" | "devnet"
): IChainConfig {
  switch (network) {
    case "mainnet":
      return SUI_MAINNET;
    case "testnet":
      return SUI_TESTNET;
    case "devnet":
      return SUI_DEVNET;
    default:
      throw new Error(`Unsupported Sui network: ${network}`);
  }
}

// Helper function to get chain identifier for Sui wallets
export function getSuiChainIdentifier(
  network: "mainnet" | "testnet" | "devnet"
): string {
  return `sui:${network}`;
}

// Helper function to extract network type from chain ID
export function getNetworkFromChainId(
  chainId: string
): "mainnet" | "testnet" | "devnet" {
  if (chainId.includes("mainnet")) return "mainnet";
  if (chainId.includes("testnet")) return "testnet";
  if (chainId.includes("devnet")) return "devnet";
  throw new Error(`Cannot determine network type from chain ID: ${chainId}`);
}
