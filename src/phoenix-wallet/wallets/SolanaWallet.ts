import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import { IWallet, Wallet } from './IWallet';
import { Chain } from '../chains/Chain';
import { SolanaChain } from '../chains/SolanaChain';
import { SolanaConnector } from '../connectors/solana/SolanaConnector';
import { SolanaWalletClient } from '../connectors/solana/SolanaWalletClient';

export type SolanaTransaction = Transaction | VersionedTransaction;

export class SolanaWallet extends Wallet<SolanaTransaction, SolanaChain, SolanaConnector, SolanaWalletClient> {

  constructor(_address: string, chain: SolanaChain, connector: SolanaConnector, walletClient: SolanaWalletClient) {
    super(_address, chain, connector, walletClient);
  }

  async signMessage(message: string): Promise<string> {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await this.walletClient.signMessage(encodedMessage);

    return Buffer.from(signedMessage).toString('base64');
  }

  async signTransaction(transaction: SolanaTransaction): Promise<string> {
    let signedTransaction;

    if ('signatures' in transaction && !('message' in transaction)) {
      signedTransaction = await this.walletClient.signTransaction(transaction);
      
      return Buffer.from(signedTransaction.serialize()).toString('base64');
    } else if ('message' in transaction) {
      signedTransaction = await this.walletClient.signTransaction(transaction);
      return Buffer.from(signedTransaction.serialize()).toString('base64');
    }

    throw new Error('Unsupported transaction type');
  }

  sendTransaction(transaction: SolanaTransaction): Promise<string> {
    return this.walletClient.sendTransaction(transaction, this.chain.provider);
  }
  sendRawTransaction(transaction: string): Promise<string> {
    return this.chain.provider.sendRawTransaction(Buffer.from(transaction, 'base64'));
  }

  async signAllTransactions(transactions: SolanaTransaction[]): Promise<string[]> {
    const signedTransactions = await this.walletClient.signAllTransactions(transactions);
    return signedTransactions.map(transaction => Buffer.from(transaction.serialize()).toString('base64'));
  }

  get address(): string {
    return this._address;
  }
}
