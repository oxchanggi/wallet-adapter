import { Chain, IChain } from '../chains/Chain';
import { IConnector } from '../connectors/IConnector';

export interface IWallet<T, K extends Chain<any>, Q extends IConnector, M> {
  chain: K;
  connector: Q;
  _walletClient: M;
  signMessage(message: string): Promise<string>;
  signTransaction(transaction: T): Promise<string>;
  sendTransaction(transaction: T): Promise<string>;
  sendRawTransaction(transaction: string): Promise<string>;
  signAllTransactions(transactions: T[]): Promise<string[]>;
  getBalance(): Promise<{ amount: string; uiAmount: string; decimals: number; symbol: string; name: string }>;
  get address(): string;
  get walletClient(): M;
}

export abstract class Wallet<T, K extends Chain<any>, Q extends IConnector, M> implements IWallet<T, K, Q, M> {
  chain: K;
  connector: Q;
  _address: string;
  _walletClient: M;
  constructor(_address: string, chain: K, connector: Q, walletClient: M) {
    this._address = _address;
    this.chain = chain;
    this.connector = connector;
    this._walletClient = walletClient;
  }
  abstract signMessage(message: string): Promise<string>;
  abstract signTransaction(transaction: T): Promise<string>;
  abstract sendTransaction(transaction: T): Promise<string>;
  abstract sendRawTransaction(transaction: string): Promise<string>;
  abstract signAllTransactions(transactions: T[]): Promise<string[]>;
  abstract getBalance(): Promise<{ amount: string; uiAmount: string; decimals: number; symbol: string; name: string }>;
  abstract get address(): string;
  get walletClient(): M {
    return this._walletClient;
  }
}
