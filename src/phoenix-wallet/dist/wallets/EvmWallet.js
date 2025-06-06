import { ethers } from 'ethers';
import { Wallet } from './IWallet';
export class EvmWallet extends Wallet {
  constructor(_address, chain, connector, walletClient) {
    super(_address, chain, connector, walletClient);
  }
  async signTransaction(transaction) {
    const request = await this.walletClient.prepareTransactionRequest({
      account: this._address,
      to: transaction.to,
      value: BigInt(transaction.value),
      chain: this.walletClient.chain,
    });
    return await this.walletClient.signTransaction({
      ...request,
      account: this._address,
    });
  }
  async signMessage(message) {
    return await this.walletClient.signMessage({
      account: this._address,
      message: message,
    });
  }
  get address() {
    return this._address;
  }
  sendTransaction(transaction) {
    return this.walletClient.sendTransaction({
      account: this._address,
      to: transaction.to,
      value: BigInt(transaction.value),
      chain: this.walletClient.chain,
    });
  }
  sendRawTransaction(transaction) {
    return this.walletClient.sendRawTransaction({
      serializedTransaction: transaction,
    });
  }
  signAllTransactions(transactions) {
    throw new Error('Method not supported');
  }
  get walletClient() {
    return this._walletClient;
  }
  async getBalance() {
    const balance = await this.chain.provider.getBalance(this._address);
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
//# sourceMappingURL=EvmWallet.js.map
