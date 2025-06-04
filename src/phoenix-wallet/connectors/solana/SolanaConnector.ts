import { 
  Connection, 
  PublicKey, 
  Transaction, 
  VersionedTransaction,
  MessageV0
} from '@solana/web3.js';
import { ConnectorConfig, ConnectorInterface, ConnectorState, DappMetadata } from "../types";
import { IWallet } from "../../wallets/IWallet";
import { SolanaTransaction } from '../../wallets/SolanaWallet';
import { Connector } from '../IConnector';
import { ChainType } from '../../chains/Chain';

export abstract class SolanaConnector extends Connector {
  // config: ConnectorConfig;
  // private state: ConnectorState;
  private provider: any = null;
  private connection: Connection | null = null;

  constructor(id: string, config: ConnectorConfig, dappMetadata: DappMetadata) {
    super(id, config.name, dappMetadata);
    // this.config = config;
    // this.state = {
    //   connecting: false,
    //   connected: false,
    //   address: null,
    //   chain: null,
    //   error: null,
    // };
  }

  async connect(): Promise<{address: string, chainId: number}> {
    // try {
    //   this.state.connecting = true;
    //   this.state.error = null;

    //   // Check if Solana provider exists
    //   if (!window.solana) {
    //     throw new Error("No Solana wallet found");
    //   }

    //   this.provider = window.solana;
      
    //   // Connect to the wallet
    //   await this.provider.connect();
      
    //   if (!this.provider.publicKey) {
    //     throw new Error("Failed to connect to Solana wallet");
    //   }

    //   const publicKey = this.provider.publicKey.toString();
      
    //   // Set up connection to Solana network
    //   this.connection = new Connection(
    //     "https://api.mainnet-beta.solana.com",
    //     "confirmed"
    //   );

    //   this.state.connected = true;
    //   this.state.address = publicKey;
      
    //   return new SolanaWallet(publicKey, this.provider);
    // } catch (error: any) {
    //   this.state.error = error;
    //   return null;
    // } finally {
    //   this.state.connecting = false;
    // }
    return {address: "", chainId: 0};
  }

  async disconnect(): Promise<void> {
    if (this.provider) {
      await this.provider.disconnect();
    }
    
    this.provider = null;
    this.connection = null;
    // this.state.connected = false;
    // this.state.address = null;
  }

  getState(): ConnectorState {
    return { 
      connecting: false,
      connected: false,
      address: null,
      chain: null,
      error: null,
     };
  }

  get chainType(): ChainType {
    return ChainType.SOLANA;
  }
}

// Ensure TypeScript recognizes the solana property on window
declare global {
  interface Window {
    solana?: any;
  }
} 