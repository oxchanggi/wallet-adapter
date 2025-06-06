import { DappMetadata } from '../types';
import { Connector } from '../IConnector';
import { ChainType, IChain } from '../../chains/Chain';
import { BaseMessageSignerWalletAdapter } from '@solana/wallet-adapter-base';
import { SolanaWalletClient } from './SolanaWalletClient';
import { Connection } from '@solana/web3.js';
export declare enum SolanaCluster {
  MAINNET = 'mainnet-beta',
  DEVNET = 'devnet',
  TESTNET = 'testnet',
  LOCALNET = 'localnet',
}
export declare class SolanaConnector extends Connector {
  protected activeAddress: string | undefined;
  protected isInitialized: boolean;
  adapter: BaseMessageSignerWalletAdapter;
  cluster: SolanaCluster;
  constructor(dappMetadata: DappMetadata, adapter: BaseMessageSignerWalletAdapter, defaultCluster?: SolanaCluster);
  init(): Promise<void>;
  isInstalled(): Promise<boolean>;
  get chainType(): ChainType;
  connect(): Promise<{
    address: string;
    chainId: string;
  }>;
  disconnect(): Promise<void>;
  getConnectedAddresses(): Promise<string[]>;
  private get _chainId();
  getChainId(): Promise<string>;
  setupEventListeners(): Promise<void>;
  isConnected(): Promise<boolean>;
  createWalletClient(chain: IChain<any>): SolanaWalletClient;
  createPublicClient(chain: IChain<any>): Connection;
  get installLink(): string;
  switchChainId(chainId: SolanaCluster): Promise<void>;
  addChain(chain: IChain<any>): Promise<void>;
  protected get storageConnectionStatusKey(): string | null;
  protected get storageAddressKey(): string | null;
  protected checkStoredConnection(): void;
}
declare global {
  interface Window {
    solana?: any;
  }
}
