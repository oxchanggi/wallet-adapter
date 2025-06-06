import { Transaction, VersionedTransaction } from '@solana/web3.js';
import { Wallet } from './IWallet';
import { SolanaChain } from '../chains/SolanaChain';
import { SolanaConnector } from '../connectors/solana/SolanaConnector';
import { SolanaWalletClient } from '../connectors/solana/SolanaWalletClient';
export type SolanaTransaction = Transaction | VersionedTransaction;
export declare class SolanaWallet extends Wallet<SolanaTransaction, SolanaChain, SolanaConnector, SolanaWalletClient> {
  constructor(_address: string, chain: SolanaChain, connector: SolanaConnector, walletClient: SolanaWalletClient);
  signMessage(message: string): Promise<string>;
  signTransaction(transaction: SolanaTransaction): Promise<string>;
  sendTransaction(transaction: SolanaTransaction): Promise<string>;
  sendRawTransaction(transaction: string): Promise<string>;
  signAllTransactions(transactions: SolanaTransaction[]): Promise<string[]>;
  get address(): string;
  getBalance(): Promise<{
    amount: string;
    uiAmount: string;
    decimals: number;
    symbol: string;
    name: string;
  }>;
}
