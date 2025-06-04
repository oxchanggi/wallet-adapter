import { Chain, IChain } from "../chains/Chain";
import { IConnector } from "../connectors/IConnector";

export interface IWallet<T, K extends Chain<any>, Q extends IConnector> {
  chain: K;
  connector: Q;
  signMessage(message: string): Promise<string>;
  signTransaction(transaction: T): Promise<string>;
  get address(): string;
}

export abstract class Wallet<T, K extends Chain<any>, Q extends IConnector> implements IWallet<T, K, Q> {
  chain: K;
  connector: Q;
  _address: string;
  constructor(_address: string, chain: K, connector: Q) {
    this._address = _address;
    this.chain = chain;
    this.connector = connector;
  }
  abstract signMessage(message: string): Promise<string>;
  abstract signTransaction(transaction: T): Promise<string>;
  abstract get address(): string;
}

