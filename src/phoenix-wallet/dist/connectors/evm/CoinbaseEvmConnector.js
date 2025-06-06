import { EvmConnector } from './EvmConnector';
export class CoinbaseEvmConnector extends EvmConnector {
  constructor(dappMetadata) {
    super(
      'coinbaseevm',
      {
        name: 'Coinbase',
        logo: 'https://images.ctfassets.net/q5ulk4bp65r7/3TBS4oVkD1ghowTqVQJlqj/2dfd4ea3b623a7c0d8deb2ff445dee9e/Consumer_Wordmark.svg',
      },
      dappMetadata
    );
  }
  get provider() {
    if (typeof window !== 'undefined' && window.coinbaseWalletExtension) {
      return window.coinbaseWalletExtension;
    } else if (typeof window !== 'undefined' && window.ethereum?.isCoinbase) {
      // Fallback to window.ethereum if it has isCoinbase property
      return window.ethereum;
    }
  }
  async isInstalled() {
    console.log('window.coinbaseWalletExtension', window.coinbaseWalletExtension);
    // Check if Coinbase Wallet's provider exists
    if (typeof window !== 'undefined') {
      return Boolean(window.coinbaseWalletExtension);
    }
    return false;
  }
  get installLink() {
    return 'https://www.coinbase.com/wallet';
  }
}
//# sourceMappingURL=CoinbaseEvmConnector.js.map
