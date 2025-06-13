import { SuiClient } from '@mysten/sui/client';
import { IChain } from '../../chains';
import { DappMetadata } from '../types';
import { SuiConnector, SuiProvider } from './SuiConnector';

export class PhantomSuiConnector extends SuiConnector {
  get installLink(): string {
    throw new Error('Method not implemented.');
  }
  createPublicClient(chain: IChain<any>) {
    const client = new SuiClient({ url: chain.provider });
    return client;
  }
  switchChainId(chainId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  addChain(chain: IChain<any>): Promise<void> {
    throw new Error('Method not implemented.');
  }
  private suiProvider: SuiProvider | null = null;
  private eventListenersSetup = false;

  constructor(dappMetadata: DappMetadata) {
    super(
      'phantom_sui',
      {
        name: 'Phantom Sui',
        logo: 'https://docs.phantom.com/~gitbook/image?url=https%3A%2F%2F187760183-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MVOiF6Zqit57q_hxJYp%252Ficon%252FU7kNZ4ygz4QW1rUwOuTT%252FWhite%2520Ghost_docs_nu.svg%3Falt%3Dmedia%26token%3D447b91f6-db6d-4791-902d-35d75c19c3d1&width=48&height=48&sign=23b24c2a&sv=2',
      },
      dappMetadata
    );
  }

  // Check if Phantom wallet with Sui support is installed
  async isInstalled(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      // Check for Phantom provider with Sui support
      const hasPhantomSui = !!(
        window.phantom?.sui ||
        // Check if Phantom is available and has Sui support
        (window.phantom && typeof window.phantom === 'object' && 'sui' in window.phantom)
      );

      return hasPhantomSui;
    } catch (error) {
      console.error('Error checking Phantom Sui installation:', error);
      return false;
    }
  }

  // Initialize connection to Phantom Sui wallet
  async connect(): Promise<{ address: string; chainId: string }> {
    try {
      if (!(await this.isInstalled())) {
        throw new Error('Phantom wallet with Sui support is not installed. Please install Phantom wallet extension.');
      }

      // Get Phantom Sui provider
      this.suiProvider = this.getPhantomSuiProvider();
      if (!this.suiProvider) {
        throw new Error('Failed to access Phantom Sui provider');
      }

      this.provider = this.suiProvider;
      await this.init();

      // Request connection
      const connectResult = await this.suiProvider.requestAccount();

      // Handle both Phantom Sui and standard response structures
      let address: string;

      if (connectResult.address) {
        // Phantom Sui format: direct address field
        address = connectResult.address;
      } else if (connectResult.accounts && connectResult.accounts.length > 0) {
        // Standard Sui wallet format: accounts array
        address = connectResult.accounts[0];
      } else {
        throw new Error('No address or accounts returned from Phantom Sui wallet');
      }

      this.storageConnect(address, 'sui:mainnet');

      return {
        address: address,
        chainId: 'sui:mainnet',
      };
    } catch (error) {
      console.error('Error connecting to Phantom Sui:', error);
      throw error;
    }
  }

  // Disconnect from Phantom Sui wallet
  async disconnect(): Promise<void> {
    try {
      await this.init();
      if (this.suiProvider && 'disconnect' in this.suiProvider) {
        await this.suiProvider.disconnect();
      }

      // Clear state
      this.activeAddress = undefined;
      this.activeChainId = undefined;
      this.provider = null;
      this.suiProvider = null;

      this.disconnectStorage();
    } catch (error) {
      console.error('Error disconnecting from Phantom Sui:', error);
      throw error;
    }
  }

  // Get connected addresses
  async getConnectedAddresses(): Promise<string[]> {
    try {
      if (!this.suiProvider) {
        return [];
      }

      const connectResult = await this.suiProvider.requestAccount();
      return [connectResult.address || ''];
    } catch (error) {
      console.error('Error getting connected addresses:', error);
      return [];
    }
  }

  // Get current chain ID
  async getChainId(): Promise<string> {
    try {
      if (!this.suiProvider) {
        throw new Error('Phantom Sui provider not available');
      }

      return this.activeChainId || 'sui:mainnet'; // Phantom typically defaults to mainnet
    } catch (error) {
      console.error('Error getting chain ID:', error);
      // Return mainnet as default for Phantom
      return 'sui:mainnet';
    }
  }

  // Setup event listeners for Phantom Sui wallet
  async setupEventListeners(): Promise<void> {
    if (!(await this.isInstalled()) || this.eventListenersSetup || !this.suiProvider) {
      return;
    }

    try {
      // Account changed events
      this.suiProvider.on('accountChanged', (...args: unknown[]) => {
        const event = args[0] as {
          address: string;
          publicKey: { [key: number]: number };
        };
        this.handleEventAccountChanged([event.address]);

        this.handleEventConnect(event.address, this.activeChainId);
      });

      // Account change events
      this.suiProvider.on('accountChange', (...args: unknown[]) => {
        const event = args[0] as {
          address: string;
          publicKey: { [key: number]: number };
        };
        this.handleEventAccountChanged([event.address]);
      });

      // Chain/Network change events
      this.suiProvider.on('chainChange', (...args: unknown[]) => {
        const event = args[0] as { chain: string };
        this.handleChainChange(event);
      });

      // Connect events
      this.suiProvider.on('connect', (...args: unknown[]) => {
        console.log('Connect event: ===================', args);
        const event = args[0] as {
          address: string;
          publicKey: { [key: number]: number };
        };
        this.handleEventConnect(event.address, this.activeChainId);
      });
      // Disconnect events
      this.suiProvider.on('disconnect', () => {
        this.handleDisconnect();
      });
      this.eventListenersSetup = true;

      console.log('Event listeners setup: ===================');
    } catch (error) {
      console.error('Error setting up Phantom Sui event listeners:', error);
    }
  }

  // Get Phantom Sui provider from window
  private getPhantomSuiProvider(): SuiProvider | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      // Check for Phantom Sui provider
      if (window.phantom?.sui) {
        return window.phantom.sui;
      }

      // Fallback: check if phantom object has sui property
      if (window.phantom && 'sui' in window.phantom) {
        const suiProvider = (window.phantom as Record<string, unknown>).sui;
        if (suiProvider && typeof suiProvider === 'object' && 'connect' in suiProvider) {
          return suiProvider as unknown as SuiProvider;
        }
      }

      return null;
    } catch (error) {
      console.error('Error accessing Phantom Sui provider:', error);
      return null;
    }
  }

  private async handleChainChange(event: { chain: string }): Promise<void> {
    try {
      const chainId = event.chain || 'sui:mainnet';
      await this.handleEventChainChanged(chainId);
    } catch (error) {
      console.error('Error handling chain change:', error);
    }
  }

  private async handleDisconnect(): Promise<void> {
    try {
      if (this.activeAddress) {
        await this.handleEventDisconnect(this.activeAddress);
      }

      // Clear state
      this.activeAddress = undefined;
      this.activeChainId = undefined;
      this.provider = null;
      this.suiProvider = null;
    } catch (error) {
      console.error('Error handling disconnect event:', error);
    }
  }

  // Additional Phantom Sui-specific methods

  // Get Phantom wallet info
  getWalletInfo(): { name: string; icon?: string } {
    return {
      name: this.suiProvider?.name || 'Phantom (Sui)',
      icon: this.suiProvider?.icon || this.logo,
    };
  }
}
