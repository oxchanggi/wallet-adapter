import { JsonRpcProvider } from 'ethers';
import { Chain, ChainType } from './Chain';
export class EvmChain extends Chain {
  constructor(chainName, config) {
    super(config);
    this._chainName = chainName;
    if (!config.privateRpcUrl) {
      throw new Error(`RPC URL is required for ${chainName}`);
    }
    this._provider = new JsonRpcProvider(config.privateRpcUrl);
  }
  get chainName() {
    return this._chainName;
  }
  get chainType() {
    return ChainType.EVM;
  }
  get provider() {
    return this._provider;
  }
}
//# sourceMappingURL=EvmChain.js.map
