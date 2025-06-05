// Re-export types
export * from "./wallets/IWallet";
export * from "./chains/Chain";
export * from "./chains/EvmChain";
export * from "./chains/SolanaChain";

export * from "./connectors/IConnector";
export * from "./connectors/evm/EvmConnector";
export * from "./connectors/evm/MetamaskEvmConnector";
export * from "./connectors/evm/PhantomEvmConnector";
export * from "./connectors/evm/MagicEdenEvmConnector";
export * from "./connectors/solana/SolanaConnector";
export * from "./connectors/evm/RainbowEvmConnector";
export * from "./connectors/evm/OkxEvmConnector";
export * from "./connectors/types";
export * from "./connectors/index";

// Contexts
export { WalletProvider, useWalletConnectors } from './contexts/WalletContext';

// Hooks
export { useWallet } from './hooks/useWallet';
export { useWalletConnectorEvent } from './hooks/useWalletConnectorEvent';

// Types
export { ConnectorStatus } from './connectors/types';
export type { WalletContextState } from './connectors/types';
