export var ChainType;
(function (ChainType) {
  ChainType['EVM'] = 'EVM';
  ChainType['SOLANA'] = 'SOLANA';
})(ChainType || (ChainType = {}));
export class Chain {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.publicRpcUrl = config.publicRpcUrl;
    this.privateRpcUrl = config.privateRpcUrl;
    this.explorerUrl = config.explorerUrl;
    this.chainId = config.chainId;
    this.nativeCurrency = config.nativeCurrency;
  }
}
//# sourceMappingURL=Chain.js.map
