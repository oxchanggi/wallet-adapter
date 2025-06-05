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
  private provider: any = null;
  private connection: Connection | null = null;

  constructor(id: string, config: ConnectorConfig, dappMetadata: DappMetadata) {
    super(id, config.name, config.logo, dappMetadata);
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