import { getProvider } from '@binance/w3w-ethereum-provider';
import { EvmConnector } from './EvmConnector';
export class BinanceEvmConnector extends EvmConnector {
  constructor(dappMetadata) {
    super(
      'binanceevm',
      {
        name: 'Binance',
        logo: 'https://static.bnbchain.org/home-ui/static/images/wallets/logo_binance-web3-wallet.svg?v=1',
      },
      dappMetadata
    );
  }
  get provider() {
    return this.binanceProvider;
  }
  get installLink() {
    return 'https://www.binance.com';
  }
  async init() {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    this.binanceProvider = getProvider();
    if (!this.provider) {
      throw new Error(this.name + ' provider not found');
    }
    this.setupEventListeners();
    // Check if we have a stored connection
    this.checkStoredConnection();
  }
  async disconnect() {
    await this.provider.disconnect();
    await super.disconnect();
  }
  get storageConnectionStatusKey() {
    return null;
  }
  async isInstalled() {
    return true;
  }
}
//# sourceMappingURL=BinanceEvmConnector.js.map
