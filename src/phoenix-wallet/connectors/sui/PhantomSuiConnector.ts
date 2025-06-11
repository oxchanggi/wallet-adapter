import { IChain } from '../../chains';
import { DappMetadata } from '../types';
import { SuiConnector, SuiProvider } from './SuiConnector';

export class PhantomSuiConnector extends SuiConnector {
  get installLink(): string {
    throw new Error('Method not implemented.');
  }
  createPublicClient(chain: IChain<any>) {
    throw new Error('Method not implemented.');
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
      'phantom-sui',
      {
        name: 'Phantom Sui',
        logo: 'https://phantom.app/favicon.ico',
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

      // Setup event listeners before connecting
      await this.setupEventListeners();

      // Request connection
      console.log('Connecting to Phantom Sui wallet');
      console.log(this.suiProvider);
      const connectResult = await this.suiProvider.requestAccount();
      console.log('Connect result:', connectResult);

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

      // Set active address
      this.activeAddress = address;

      // Get current chain
      // this.activeChainId = await this.getChainId();
      this.activeChainId = 'sui:mainnet'; // TODO: fix this

      return {
        address: this.activeAddress,
        chainId: this.activeChainId,
      };
    } catch (error) {
      console.error('Error connecting to Phantom Sui:', error);
      throw error;
    }
  }

  // Disconnect from Phantom Sui wallet
  async disconnect(): Promise<void> {
    try {
      if (this.suiProvider && 'disconnect' in this.suiProvider) {
        await this.suiProvider.disconnect();
      }

      // Clear state
      this.activeAddress = undefined;
      this.activeChainId = undefined;
      this.provider = null;
      this.suiProvider = null;
      this.suiClient = null;

      // Remove event listeners
      this.removeEventListeners();
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

      const chain = await this.suiProvider.getChain();
      return chain || 'sui:mainnet'; // Phantom typically defaults to mainnet
    } catch (error) {
      console.error('Error getting chain ID:', error);
      // Return mainnet as default for Phantom
      return 'sui:mainnet';
    }
  }

  // Setup event listeners for Phantom Sui wallet
  async setupEventListeners(): Promise<void> {
    if (!this.suiProvider || this.eventListenersSetup) {
      return;
    }

    try {
      // Account changed events
      this.suiProvider.on('accountChanged', (...args: unknown[]) => {
        const event = args[0] as {
          address: string;
          publicKey: { [key: number]: number };
        };
        this.handleAccountChange({
          accounts: [event.address],
        });

        this.handleConnect({
          accounts: [event.address],
        });
      });

      // Account change events
      this.suiProvider.on('accountChange', (...args: unknown[]) => {
        const event = args[0] as {
          address: string;
          publicKey: { [key: number]: number };
        };
        this.handleAccountChange({
          accounts: [event.address],
        });
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
        this.handleConnect({
          accounts: [event.address],
        });
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

  // Remove event listeners
  private removeEventListeners(): void {
    if (!this.suiProvider || !this.eventListenersSetup) {
      return;
    }

    try {
      this.suiProvider.off('accountChanged', (...args: unknown[]) => {
        const event = args[0] as {
          address: string;
          publicKey: { [key: number]: number };
        };
        this.handleAccountChange({
          accounts: [event.address],
        });
      });

      this.suiProvider.off('accountChange', (...args: unknown[]) => {
        const event = args[0] as {
          address: string;
          publicKey: { [key: number]: number };
        };
        this.handleAccountChange({
          accounts: [event.address],
        });
      });
      this.suiProvider.off('chainChange', (...args: unknown[]) => {
        const event = args[0] as { chain: string };
        this.handleChainChange(event);
      });
      this.suiProvider.off('connect', (...args: unknown[]) => {
        const event = args[0] as {
          address: string;
          publicKey: { [key: number]: number };
        };
        this.handleConnect({
          accounts: [event.address],
        });
      });
      this.suiProvider.off('disconnect', () => {
        this.handleDisconnect();
      });

      this.eventListenersSetup = false;
    } catch (error) {
      console.error('Error removing Phantom Sui event listeners:', error);
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

  // Event handlers
  private async handleAccountChange(event: { accounts: string[] }): Promise<void> {
    try {
      const accounts = event.accounts || [];
      await this.handleEventAccountChanged(accounts);
    } catch (error) {
      console.error('Error handling account change:', error);
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

  private async handleConnect(event: { accounts: string[] }): Promise<void> {
    try {
      const accounts = event.accounts || [];
      if (accounts.length > 0) {
        this.activeAddress = accounts[0];
        this.activeChainId = await this.getChainId();
        await this.handleEventConnect(this.activeAddress, this.activeChainId);
      }
    } catch (error) {
      console.error('Error handling connect event:', error);
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
      this.suiClient = null;
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

  // Check if currently connected to Phantom Sui
  async isConnected(): Promise<boolean> {
    return (await super.isConnected()) && !!this.suiProvider;
  }

  // Get Phantom version (if available)
  getWalletVersion(): string | undefined {
    try {
      return (this.suiProvider as unknown as { version?: string })?.version;
    } catch {
      return undefined;
    }
  }

  // Check if this is actually Phantom wallet
  isPhantomWallet(): boolean {
    if (!this.suiProvider) return false;

    return !!(
      this.suiProvider.name === 'Phantom' ||
      this.suiProvider.name === 'Phantom Sui' ||
      // Check window.phantom exists to confirm it's Phantom
      (typeof window !== 'undefined' && window.phantom)
    );
  }

  // Get Phantom-specific features (if any)
  getPhantomFeatures(): {
    hasMultiChain?: boolean;
    hasEthereumSupport?: boolean;
    hasSolanaSupport?: boolean;
    hasSuiSupport?: boolean;
  } {
    try {
      if (typeof window === 'undefined' || !window.phantom) {
        return {};
      }

      const phantom = window.phantom as Record<string, unknown>;
      return {
        hasMultiChain: true, // Phantom is a multi-chain wallet
        hasEthereumSupport: !!phantom.ethereum,
        hasSolanaSupport: !!phantom.solana,
        hasSuiSupport: !!phantom.sui,
      };
    } catch {
      return {
        hasMultiChain: true,
        hasSuiSupport: true,
      };
    }
  }
}
