// Export main provider
export { PhoenixPrivyProvider } from './PhoenixPrivyProvider';
export type { PhoenixPrivyProviderProps } from './PhoenixPrivyProvider';

// Export enhanced provider (multi-chain support)
export { EnhancedPhoenixPrivyProvider } from './EnhancedPhoenixPrivyProvider';
export type { EnhancedPhoenixPrivyProviderProps } from './EnhancedPhoenixPrivyProvider';

// Export connector
export { PrivyConnector } from './PrivyConnector';
export type { PrivyConnectorConfig } from './PrivyConnector';

// Export bridge components
export { PrivyBridge, usePrivyBridge } from './PrivyBridge';

// Export types
export type { PrivyContext, PrivyWallet, PrivyUser } from './PrivyContext';

// Export Solana components
export * from './solana';
