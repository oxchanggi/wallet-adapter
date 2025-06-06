import { Wallet } from './IWallet';
import { EvmChain } from '../chains/EvmChain';
import { EvmConnector } from '../connectors';
import { WalletClient } from 'viem';
export interface EvmTransaction {
  to: string;
  value: string;
  data: string;
  gasLimit?: string;
  gasPrice?: string;
}
export declare class EvmWallet extends Wallet<EvmTransaction, EvmChain, EvmConnector, WalletClient> {
  constructor(_address: string, chain: EvmChain, connector: EvmConnector, walletClient: WalletClient);
  signTransaction(transaction: EvmTransaction): Promise<string>;
  signMessage(message: string): Promise<string>;
  get address(): string;
  sendTransaction(transaction: EvmTransaction): Promise<string>;
  sendRawTransaction(transaction: string): Promise<string>;
  signAllTransactions(transactions: EvmTransaction[]): Promise<string[]>;
  get walletClient(): WalletClient;
  getBalance(): Promise<{
    amount: string;
    uiAmount: string;
    decimals: number;
    symbol: string;
    name: string;
  }>;
}
