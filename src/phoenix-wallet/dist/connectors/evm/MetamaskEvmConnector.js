import { MetaMaskSDK } from '@metamask/sdk';
import { EvmConnector } from './EvmConnector';
export class MetamaskEvmConnector extends EvmConnector {
  constructor(dappMetadata) {
    super(
      'metamaskevm',
      {
        name: 'Metamask',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
      },
      dappMetadata
    );
    this.sdk = null;
  }
  get provider() {
    return this.sdk?.getProvider();
  }
  async init() {
    if (this.sdk) {
      return;
    }
    this.sdk = new MetaMaskSDK({
      dappMetadata: {
        name: this.dappMetadata.name,
        url: this.dappMetadata.url,
      },
    });
    await this.sdk.init();
    super.init();
  }
  async isInstalled() {
    // Check if window.ethereum exists and if it has the isMetaMask property
    if (typeof window !== 'undefined' && window.ethereum) {
      return Boolean(window.ethereum.isMetaMask);
    }
    return false;
  }
  async disconnect() {
    await this.sdk?.terminate();
  }
  get installLink() {
    return 'https://metamask.io/download/';
  }
}
//# sourceMappingURL=MetamaskEvmConnector.js.map
