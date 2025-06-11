import { ConnectorConfig, DappMetadata } from "../types";
import { Connector } from "../IConnector";
import { ChainType } from "../../chains/Chain";
import { SuiChain } from "../../chains/SuiChain";
import { SuiClient } from "@mysten/sui/client";
import {
  SuiTransactionResponse,
  SuiSignedTransaction,
  SuiSignedMessage,
  SuiSignAndExecuteTransactionBlockInput,
  SuiSignTransactionBlockInput,
  SuiConnectResult,
  SuiWalletEventType,
} from '../../types/sui';
import { SuiWalletClient } from './SuiWalletClient';

// Sui Provider Interface - Standard Sui Wallet Interface
export interface SuiProvider {
  // Standard connection methods
  requestAccount(): Promise<SuiConnectResult>;
  disconnect(): Promise<void>;
  getAccounts(): Promise<string[]>;

  // Network methods
  getChain(): Promise<string>;

  // Transaction methods
  signAndExecuteTransaction(input: SuiSignAndExecuteTransactionBlockInput): Promise<SuiTransactionResponse>;
  signTransaction(input: SuiSignTransactionBlockInput): Promise<SuiSignedTransaction>;
  signMessage(message: Uint8Array<ArrayBufferLike>, account?: string): Promise<SuiSignedMessage>;

  // Event methods
  on(event: SuiWalletEventType, callback: (...args: unknown[]) => void): void;
  off(event: SuiWalletEventType, callback: (...args: unknown[]) => void): void;

  // Wallet info
  name?: string;
  icon?: string;
}

export abstract class SuiConnector extends Connector {
  protected activeAddress: string | undefined = undefined;
  protected activeChainId: string | undefined = undefined;
  protected provider: SuiProvider | null = null;
  protected suiClient: SuiClient | null = null;

  constructor(id: string, config: ConnectorConfig, dappMetadata: DappMetadata) {
    super(id, config.name, config.logo, dappMetadata);
  }

  get chainType(): ChainType {
    return ChainType.SUI;
  }

  // Handle account change events (similar to EvmConnector pattern)
  async handleEventAccountChanged(addresses: string[]): Promise<void> {
    if (addresses.length === 0) {
      // No accounts connected - handle disconnect
      if (this.activeAddress) {
        this.handleEventDisconnect(this.activeAddress);
        this.activeAddress = undefined;
        this.activeChainId = undefined;
      }
    } else {
      // Account connected or changed
      if (this.activeAddress !== addresses[0]) {
        this.activeAddress = addresses[0];
        this.activeChainId = await this.getChainId();
        this.handleEventConnect(this.activeAddress, this.activeChainId);
      }
    }
    super.handleEventAccountChanged(addresses);
  }

  // Handle chain/network change events
  async handleEventChainChanged(chainId: string): Promise<void> {
    if (this.activeChainId !== chainId) {
      this.activeChainId = chainId;
      // Update SuiClient with new network
      if (this.suiClient && this.activeChainId) {
        this.suiClient = this.createSuiClientForNetwork(this.activeChainId);
      }
    }
    super.handleEventChainChanged(chainId);
  }

  // Create SuiClient for specific network
  protected createSuiClientForNetwork(chainId: string): SuiClient {
    let rpcUrl: string;

    // Map Sui chain identifiers to RPC URLs
    switch (chainId.toLowerCase()) {
      case 'sui:mainnet':
        rpcUrl = 'https://fullnode.mainnet.sui.io:443';
        break;
      case 'sui:testnet':
        rpcUrl = 'https://fullnode.testnet.sui.io:443';
        break;
      case 'sui:devnet':
        rpcUrl = 'https://fullnode.devnet.sui.io:443';
        break;
      default:
        // Default to devnet for unknown chains
        rpcUrl = 'https://fullnode.devnet.sui.io:443';
    }

    return new SuiClient({ url: rpcUrl });
  }

  // Create wallet client for Sui operations (similar to EvmConnector.createWalletClient)
  createWalletClient(chain: SuiChain): SuiWalletClient {
    if (!this.provider) {
      throw new Error('Sui provider not available');
    }

    return new SuiWalletClient(this.provider);
  }

  // Abstract methods that must be implemented by concrete connectors
  abstract connect(): Promise<{ address: string; chainId: string }>;
  abstract disconnect(): Promise<void>;
  abstract getConnectedAddresses(): Promise<string[]>;
  abstract getChainId(): Promise<string>;
  abstract setupEventListeners(): Promise<void>;
  abstract isInstalled(): Promise<boolean>;

  // Sui-specific helper methods
  protected async getNetworkFromChainId(chainId: string): Promise<'mainnet' | 'testnet' | 'devnet'> {
    const networkPart = chainId.toLowerCase().split(':')[1];
    switch (networkPart) {
      case 'mainnet':
      case 'testnet':
      case 'devnet':
        return networkPart;
      default:
        return 'devnet'; // Default fallback
    }
  }

  // Get current Sui client instance
  protected getSuiClient(): SuiClient | null {
    return this.suiClient;
  }

  // Get current provider (public getter for wallet access)
  getProvider(): SuiProvider | null {
    return this.provider;
  }

  // Check if currently connected
  async isConnected(): Promise<boolean> {
    return !!(this.activeAddress && this.provider);
  }

  // Get active account address
  protected getActiveAddress(): string | undefined {
    return this.activeAddress;
  }

  // Get active chain ID
  protected getActiveChainId(): string | undefined {
    return this.activeChainId;
  }
}

// Extend global Window interface for Sui wallet providers
declare global {
  interface Window {
    suiet?: {
      sui?: SuiProvider;
    };
    sui?: SuiProvider;
    ethos?: SuiProvider;
    martian?: {
      sui?: SuiProvider;
    };
    phantom?: any & {
      sui?: SuiProvider;
    };
  }
}
