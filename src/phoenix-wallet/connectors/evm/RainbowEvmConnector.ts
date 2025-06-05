import { DappMetadata } from '../types';
import { EvmConnector } from './EvmConnector';

export class RainbowEvmConnector extends EvmConnector {
  constructor(dappMetadata: DappMetadata) {
    super(
      'rainbowevm',
      {
        name: 'Rainbow',
        logo: 'https://rainbowkit.com/rainbow.svg',
      },
      dappMetadata
    );
  }

  get provider(): any {
    if (typeof window !== 'undefined' && window.rainbow?.ethereum) {
      return window.rainbow.ethereum;
    } else if (typeof window !== 'undefined' && window.ethereum?.isRainbow) {
      // Fallback to window.ethereum if it has isPhantom property
      return window.ethereum;
    }
  }

  async isInstalled(): Promise<boolean> {
    // Check if Rainbow's Ethereum provider exists
    if (typeof window !== 'undefined') {
      return Boolean(window.rainbow?.ethereum || window.ethereum?.isRainbow);
    }
    return false;
  }
}

declare global {
  interface Window {
    rainbow?: any;
  }
}
