import { Connection } from '@solana/web3.js';
import { Chain, ChainType } from './Chain';
export class SolanaChain extends Chain {
  constructor(chainName, config) {
    super(config);
    this._chainName = chainName;
    this._provider = new Connection(config.privateRpcUrl);
  }
  get chainName() {
    return this._chainName;
  }
  get chainType() {
    return ChainType.SOLANA;
  }
  get provider() {
    return this._provider;
  }
}
//# sourceMappingURL=SolanaChain.js.map
