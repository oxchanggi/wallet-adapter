import { Adapter, BaseMessageSignerWalletAdapter } from "@solana/wallet-adapter-base";
import { Connection, Transaction, VersionedTransaction } from "@solana/web3.js";
export class SolanaWalletClient {
    private _adapter: BaseMessageSignerWalletAdapter;
    constructor(adapter: BaseMessageSignerWalletAdapter) {
        this._adapter = adapter;
    }

    signTransaction(transaction: Transaction | VersionedTransaction): Promise<Transaction | VersionedTransaction> {
        return this._adapter.signTransaction(transaction);
    }

    sendTransaction(transaction: Transaction | VersionedTransaction, connection: Connection): Promise<string> {
        return this._adapter.sendTransaction(transaction, connection);
    }

    signAllTransactions(transactions: (Transaction| VersionedTransaction)[]): Promise<string[]> {
        return this._adapter.signAllTransactions(transactions).then(signedTransactions => signedTransactions.map(transaction => transaction.serialize().toString('hex')));
    }

    signMessage(message: string): Promise<string> {
        const messageBytes = new TextEncoder().encode(message);
        return this._adapter.signMessage(messageBytes).then(signature => Buffer.from(signature).toString('hex'));
    }
}