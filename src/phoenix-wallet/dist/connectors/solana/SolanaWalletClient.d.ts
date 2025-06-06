import { BaseMessageSignerWalletAdapter, SendTransactionOptions } from '@solana/wallet-adapter-base';
import { Connection, Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
export declare class SolanaWalletClient {
  private _adapter;
  constructor(adapter: BaseMessageSignerWalletAdapter);
  signTransaction(transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction>;
  sendTransaction(
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendTransactionOptions
  ): Promise<TransactionSignature>;
  signAllTransactions(
    transactions: (Transaction | VersionedTransaction)[]
  ): Promise<(Transaction | VersionedTransaction)[]>;
  signMessage(message: Uint8Array): Promise<Uint8Array>;
}
