import { EvmConnector } from './EvmConnector';
export class RabbyEvmConnector extends EvmConnector {
  constructor(dappMetadata) {
    super(
      'rabbyevm',
      {
        name: 'Rabby',
        logo: 'https://support.rabby.io/hc/theming_assets/01JC4R9TT03CH3B245S96TY9XF',
      },
      dappMetadata
    );
  }
  get provider() {
    if (typeof window !== 'undefined' && window.rabby) {
      return window.rabby;
    } else if (typeof window !== 'undefined' && window.ethereum?.isRabby) {
      // Fallback to window.ethereum if it has isRabby property
      return window.ethereum;
    }
  }
  async isInstalled() {
    console.log('window.ethereum', window.rabby);
    // Check if window.ethereum exists and if it has the isRabby property
    if (typeof window !== 'undefined' && window.rabby) {
      console.log('window.rabby', window.rabby);
      return Boolean(window.rabby);
    }
    return false;
  }
  get installLink() {
    return 'https://rabby.io/';
  }
}
//# sourceMappingURL=RabbyEvmConnector.js.map
