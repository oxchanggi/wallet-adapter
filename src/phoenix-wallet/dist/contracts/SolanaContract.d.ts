import { Connection } from '@solana/web3.js';
import { Contract } from './IContract';
export declare class SolanaContract<T> extends Contract {
  protected connection: Connection;
  protected sdk: T;
  constructor(connection: Connection, address: string, sdk: T);
  initialize(): Promise<void>;
  waitTransaction(txHash: string, blockhash: string, lastValidBlockHeight: number): Promise<any>;
}
