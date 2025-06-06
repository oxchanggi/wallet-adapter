export class Wallet {
  constructor(_address, chain, connector, walletClient) {
    this._address = _address;
    this.chain = chain;
    this.connector = connector;
    this._walletClient = walletClient;
  }
  get walletClient() {
    return this._walletClient;
  }
}
//# sourceMappingURL=IWallet.js.map
