export class SolanaWalletClient {
  constructor(adapter) {
    this._adapter = adapter;
  }
  signTransaction(transaction) {
    console.log('signTransaction', transaction);
    return this._adapter.signTransaction(transaction);
  }
  sendTransaction(transaction, connection, options) {
    return this._adapter.sendTransaction(transaction, connection, options);
  }
  signAllTransactions(transactions) {
    console.log('signAllTransactions', transactions);
    return this._adapter.signAllTransactions(transactions);
  }
  signMessage(message) {
    return this._adapter.signMessage(message);
  }
}
//# sourceMappingURL=SolanaWalletClient.js.map
