import { DappMetadata } from '../types';
import { EvmConnector } from './EvmConnector';

export class MagicEdenEvmConnector extends EvmConnector {
  constructor(dappMetadata: DappMetadata) {
    super(
      'magic_eden_evm',
      {
        name: 'Magic Eden',
        logo: 'https://docs-wallet.magiceden.io/~gitbook/image?url=https%3A%2F%2F3057797283-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FUE3YlWFGNzodYaTOyoul%252Ficon%252FkLCRbdWVKD83XgHxrzOC%252FMEWallet_ChromeExtention_128x128.png%3Falt%3Dmedia%26token%3D64329dca-c574-49ff-975d-bf8546b9a8ef&width=32&dpr=1&quality=100&sign=2a7c5e6e&sv=2',
      },
      dappMetadata
    );
  }

  get provider(): any {
    if (typeof window !== 'undefined' && window.magicEden?.ethereum) {
      return window.magicEden.ethereum;
    } else if (typeof window !== 'undefined' && window.ethereum?.isMagicEden) {
      // Fallback to window.ethereum if it has isPhantom property
      return window.ethereum;
    }
  }

  async isInstalled(): Promise<boolean> {
    // Check if Magic Eden's Ethereum provider exists
    if (typeof window !== 'undefined') {
      return Boolean(window.magicEden?.ethereum || window.ethereum?.isMagicEden);
    }
    return false;
  }

  get installLink(): string {
    return 'https://docs-wallet.magiceden.io/';
  }
}

declare global {
  interface Window {
    magicEden?: any;
  }
}
