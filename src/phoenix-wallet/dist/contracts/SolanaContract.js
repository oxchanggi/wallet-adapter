import { Contract } from './IContract';
export class SolanaContract extends Contract {
  constructor(connection, address, sdk) {
    super(address);
    this.connection = connection;
    this.sdk = sdk;
  }
  initialize() {
    return Promise.resolve();
  }
  async waitTransaction(txHash, blockhash, lastValidBlockHeight) {
    return await this.connection.confirmTransaction({
      signature: txHash,
      blockhash,
      lastValidBlockHeight,
    });
  }
}
//# sourceMappingURL=SolanaContract.js.map
