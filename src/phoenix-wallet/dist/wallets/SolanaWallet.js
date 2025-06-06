import { PublicKey } from '@solana/web3.js';
import { Wallet } from './IWallet';
import { ethers } from 'ethers';
export class SolanaWallet extends Wallet {
  constructor(_address, chain, connector, walletClient) {
    super(_address, chain, connector, walletClient);
  }
  async signMessage(message) {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await this.walletClient.signMessage(encodedMessage);
    return Buffer.from(signedMessage).toString('base64');
  }
  async signTransaction(transaction) {
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
  sendTransaction(transaction) {
    return this.walletClient.sendTransaction(transaction, this.chain.provider);
  }
  sendRawTransaction(transaction) {
    return this.chain.provider.sendRawTransaction(Buffer.from(transaction, 'base64'));
  }
  async signAllTransactions(transactions) {
    const signedTransactions = await this.walletClient.signAllTransactions(transactions);
    return signedTransactions.map((transaction) => Buffer.from(transaction.serialize()).toString('base64'));
  }
  get address() {
    return this._address;
  }
  async getBalance() {
    const balance = await this.chain.provider.getBalance(new PublicKey(this._address));
    const nativeCurrency = this.chain.nativeCurrency;
    const uiAmount = ethers.formatUnits(balance, nativeCurrency.decimals);
    return {
      amount: balance.toString(),
      uiAmount: uiAmount,
      decimals: nativeCurrency.decimals,
      symbol: nativeCurrency.symbol,
      name: nativeCurrency.name,
    };
  }
}
//# sourceMappingURL=SolanaWallet.js.map
