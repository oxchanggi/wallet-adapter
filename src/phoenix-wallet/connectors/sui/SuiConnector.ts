import { ConnectorConfig, DappMetadata } from '../types';
import { Connector } from '../IConnector';
import { ChainType, IChain } from '../../chains/Chain';
import { SuiChain } from '../../chains/SuiChain';
import { SuiClient } from '@mysten/sui/client';
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
  protected isInitialized: boolean = false;

  constructor(id: string, config: ConnectorConfig, dappMetadata: DappMetadata) {
    super(id, config.name, config.logo, dappMetadata);
  }

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    this.setupEventListeners();

    // Check if we have a stored connection
    this.checkStoredConnection();
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
    }
    super.handleEventChainChanged(chainId);
  }

  createPublicClient(chain: IChain<any>) {
    return new SuiClient({ url: chain.publicRpcUrl });
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

  storageConnect(address: string, chainId: string): void {
    this.activeAddress = address;
    this.activeChainId = chainId;

    // Store connection status in localStorage
    if (typeof localStorage !== 'undefined') {
      if (this.storageConnectionStatusKey) {
        localStorage.setItem(this.storageConnectionStatusKey, 'connected');
      }
      if (this.storageAddressKey && this.activeAddress) {
        localStorage.setItem(this.storageAddressKey, this.activeAddress);
      }
    }
  }

  disconnectStorage(): void {
    if (typeof localStorage !== 'undefined') {
      if (this.storageConnectionStatusKey) {
        localStorage.removeItem(this.storageConnectionStatusKey);
      }
      if (this.storageAddressKey) {
        localStorage.removeItem(this.storageAddressKey);
      }
    }
  }

  // Get current provider (public getter for wallet access)
  getProvider(): SuiProvider | null {
    return this.provider;
  }

  // Get active account address
  protected getActiveAddress(): string | undefined {
    return this.activeAddress;
  }

  // Get active chain ID
  protected getActiveChainId(): string | undefined {
    return this.activeChainId;
  }

  //This function should check if the wallet is connected to the chain, and when application is reloaded, it should check if the wallet is connected to the chain
  async isConnected(): Promise<boolean> {
    try {
      if (this.storageConnectionStatusKey) {
        const storedStatus = localStorage.getItem(this.storageConnectionStatusKey);
        if (!storedStatus) {
          return false;
        }
      }

      if (this.activeAddress) {
        return true;
      }

      return !!this.provider;
    } catch (error) {
      console.error(`Error checking if ${this.id} is connected:`, error);
      return false;
    }
  }

  protected get storageConnectionStatusKey(): string | null {
    return `phoenix_${this.id}_sui_connection_status`;
  }

  protected get storageAddressKey(): string | null {
    return `phoenix_${this.id}_sui_address`;
  }

  protected checkStoredConnection(): void {
    if (typeof localStorage !== 'undefined' && this.storageConnectionStatusKey) {
      const storedStatus = localStorage.getItem(this.storageConnectionStatusKey);
      if (storedStatus === 'connected') {
        // Check if we have a stored address
        if (this.storageAddressKey) {
          const storedAddress = localStorage.getItem(this.storageAddressKey);
          if (storedAddress) {
            this.activeAddress = storedAddress;
            this.handleEventConnect(this.activeAddress, this.activeChainId);
          } else {
            localStorage.removeItem(this.storageConnectionStatusKey);
          }
        }
      }
    }
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
