import { DappMetadata } from '../types'
import { EvmConnector } from './EvmConnector'

export class PhantomEvmConnector extends EvmConnector {
  constructor(dappMetadata: DappMetadata) {
    super(
      'phantomevm',
      {
        name: 'Phantom',
        logo: 'https://docs.phantom.com/~gitbook/image?url=https%3A%2F%2F187760183-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MVOiF6Zqit57q_hxJYp%252Ficon%252FU7kNZ4ygz4QW1rUwOuTT%252FWhite%2520Ghost_docs_nu.svg%3Falt%3Dmedia%26token%3D447b91f6-db6d-4791-902d-35d75c19c3d1&width=48&height=48&sign=23b24c2a&sv=2',
      },
      dappMetadata
    )
  }

  get provider(): any {
    if (typeof window !== 'undefined' && window.phantom?.ethereum) {
      return window.phantom.ethereum
    } else if (typeof window !== 'undefined' && window.ethereum?.isPhantom) {
      // Fallback to window.ethereum if it has isPhantom property
      return window.ethereum
    }
  }

  async isInstalled(): Promise<boolean> {
    // Check if Phantom's Ethereum provider exists
    if (typeof window !== 'undefined') {
      return Boolean(window.phantom?.ethereum || window.ethereum?.isPhantom)
    }
    return false
  }
}
