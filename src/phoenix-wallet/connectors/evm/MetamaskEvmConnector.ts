import { MetaMaskSDK } from '@metamask/sdk';
import { DappMetadata } from '../types';
import { EvmConnector } from './EvmConnector';

export class MetamaskEvmConnector extends EvmConnector {
  private sdk: MetaMaskSDK | null = null;

  constructor(dappMetadata: DappMetadata) {
    super(
      'metamaskevm',
      {
        name: 'Metamask',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
      },
      dappMetadata
    );
  }

  get provider(): any {
    return this.sdk?.getProvider();
  }

  async init(): Promise<void> {
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

  async isInstalled(): Promise<boolean> {
    // Check if window.ethereum exists and if it has the isMetaMask property
    if (typeof window !== 'undefined' && window.ethereum) {
      return Boolean(window.ethereum.isMetaMask);
    }
    return false;
  }

  async disconnect(): Promise<void> {
    await this.sdk?.terminate();
  }

  get installLink(): string {
    return 'https://metamask.io/download/';
  }
}
