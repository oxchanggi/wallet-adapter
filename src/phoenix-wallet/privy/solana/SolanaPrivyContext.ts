// Type definitions for Solana Privy integration
export interface SolanaPrivyWallet {
  address: string;
  chainId?: string; // Solana cluster name (solana_mainnet_beta, devnet, testnet)
  walletClient?: unknown;
  publicKey?: string;
  disconnect: () => Promise<void>;
  switchCluster?: (clusterId: string) => Promise<void>;
  // Add other Solana wallet properties as needed
  signTransaction?: (transaction: unknown) => Promise<unknown>;
  signAllTransactions?: (transactions: unknown[]) => Promise<unknown[]>;
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
}

export interface SolanaPrivyContext {
  // Solana wallet state
  ready: boolean;
  wallets: SolanaPrivyWallet[];

  // Solana wallet methods
  connectWallet: () => Promise<SolanaPrivyWallet>;
  createWallet?: () => Promise<SolanaPrivyWallet>;

  // Connection state
  connecting: boolean;
  connected: boolean;
}
