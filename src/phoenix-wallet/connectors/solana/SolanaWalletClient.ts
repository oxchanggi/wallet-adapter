import { BaseMessageSignerWalletAdapter, SendTransactionOptions } from '@solana/wallet-adapter-base';
import { Connection, Transaction, TransactionSignature, VersionedTransaction } from '@solana/web3.js';
export class SolanaWalletClient {
  private _adapter: BaseMessageSignerWalletAdapter;
  constructor(adapter: BaseMessageSignerWalletAdapter) {
    this._adapter = adapter;
  }

  signTransaction(transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction> {
    console.log('signTransaction', transaction);
    return this._adapter.signTransaction(transaction);
  }

  sendTransaction(transaction: Transaction | VersionedTransaction, connection: Connection, options?: SendTransactionOptions): Promise<TransactionSignature> {
    return this._adapter.sendTransaction(transaction, connection, options);
  }

  signAllTransactions(transactions: (Transaction | VersionedTransaction)[]): Promise<(Transaction | VersionedTransaction)[]> {
    console.log('signAllTransactions', transactions);
    return this._adapter.signAllTransactions(transactions)
  }

  signMessage(message: Uint8Array): Promise<Uint8Array> {
    return this._adapter.signMessage(message)
  }
}
