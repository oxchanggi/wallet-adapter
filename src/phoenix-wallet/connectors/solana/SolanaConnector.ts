
import { ConnectorConfig, ConnectorInterface, ConnectorState, DappMetadata } from "../types";
import { Connector } from '../IConnector';
import { ChainType, IChain } from '../../chains/Chain';
import { BaseMessageSignerWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import { SolanaWalletClient } from './SolanaWalletClient';

export abstract class SolanaConnector extends Connector {
  protected activeAddress: string | undefined = undefined;
  protected isInitialized: boolean = false;
  abstract get adapter(): BaseMessageSignerWalletAdapter;

  constructor(id: string, config: ConnectorConfig, dappMetadata: DappMetadata) {
    super(id, config.name, config.logo, dappMetadata);
  }

  async init(): Promise<void> {
    if (!this.adapter) {
      throw new Error(this.name + " adapter not found");
    }

    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    this.setupEventListeners();
  }

  async isInstalled(): Promise<boolean> {
    await this.init();
    return this.adapter.readyState == WalletReadyState.Installed;
 }

  get chainType(): ChainType {
    return ChainType.SOLANA;
  }

  async connect(): Promise<{ address: string; chainId: string; }> {
    await this.init();
    console.log("Connecting to Solana");
    await this.adapter.connect();
    return {
      address: this.adapter.publicKey?.toBase58() ?? '',
      chainId: 'solana'
    };
  }

  async disconnect(): Promise<void> {
    await this.init();
    await this.adapter.disconnect();
  }

  async getConnectedAddresses(): Promise<string[]> {
    await this.init();
    return [this.adapter.publicKey?.toBase58() ?? ''];
  }

  async getChainId(): Promise<string> {
    return 'solana';
  }

  async setupEventListeners(): Promise<void> {
    if (!await this.isInstalled()) return;

    this.adapter.on('connect', () => {
      if (this.activeAddress != this.adapter.publicKey?.toBase58() && this.adapter.publicKey?.toBase58()) {
        this.activeAddress = this.adapter.publicKey?.toBase58();
        this.handleEventConnect(this.activeAddress, 'solana');
      }
    });

    this.adapter.on('disconnect', () => {
      if (this.activeAddress) {
        this.handleEventDisconnect(this.activeAddress);
        this.activeAddress = undefined;
      } 
    });
  }

  async isConnected(): Promise<boolean> {
    return false
  }

  createWalletClient(chain: IChain<any>) {
    if (!this.adapter) {
      throw new Error("Solana adapter not found");
    }
    return new SolanaWalletClient(this.adapter);
  }
}

// Ensure TypeScript recognizes the solana property on window
declare global {
  interface Window {
    solana?: any;
  }
} 