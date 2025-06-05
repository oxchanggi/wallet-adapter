import { DappMetadata } from "../types";
import { SuiConnector, SuiProvider } from "./SuiConnector";

export class SlushConnector extends SuiConnector {
  private suiProvider: SuiProvider | null = null;
  private eventListenersSetup = false;

  constructor(dappMetadata: DappMetadata) {
    super(
      "slush",
      {
        name: "Slush",
        logo: "https://slushwallet.com/favicon.ico",
      },
      dappMetadata
    );
  }

  // Check if Slush wallet is installed
  async isInstalled(): Promise<boolean> {
    try {
      if (typeof window === "undefined") {
        return false;
      }

      // Check for Slush provider - Slush uses window.sui
      const hasSlush = !!(
        window.sui &&
        (window.sui.name === "Slush" ||
          window.sui.name === "Slush Wallet" ||
          // Check if it's Slush by looking at properties
          (window.sui as unknown as { isSlush?: boolean }).isSlush ||
          // Fallback: if window.sui exists but no other wallet claimed it
          (!window.sui.name && window.sui))
      );

      return hasSlush;
    } catch (error) {
      console.error("Error checking Slush installation:", error);
      return false;
    }
  }

  // Initialize connection to Slush wallet
  async connect(): Promise<{ address: string; chainId: string }> {
    try {
      if (!(await this.isInstalled())) {
        throw new Error(
          "Slush wallet is not installed. Please install Slush wallet extension."
        );
      }

      // Get Slush provider
      this.suiProvider = this.getSlushProvider();
      if (!this.suiProvider) {
        throw new Error("Failed to access Slush provider");
      }

      this.provider = this.suiProvider;

      // Setup event listeners before connecting
      await this.setupEventListeners();

      // Request connection
      const connectResult = await this.suiProvider.requestAccount();

      if (!connectResult.accounts || connectResult.accounts.length === 0) {
        throw new Error("No accounts returned from Slush wallet");
      }

      // Set active address
      this.activeAddress = connectResult.accounts[0];

      // Get current chain
      this.activeChainId = await this.getChainId();

      return {
        address: this.activeAddress,
        chainId: this.activeChainId,
      };
    } catch (error) {
      console.error("Error connecting to Slush:", error);
      throw error;
    }
  }

  // Disconnect from Slush wallet
  async disconnect(): Promise<void> {
    try {
      if (this.suiProvider) {
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
      console.error("Error disconnecting from Slush:", error);
      throw error;
    }
  }

  // Get connected addresses
  async getConnectedAddresses(): Promise<string[]> {
    try {
      if (!this.suiProvider) {
        return [];
      }

      const accounts = await this.suiProvider.getAccounts();
      return accounts || [];
    } catch (error) {
      console.error("Error getting connected addresses:", error);
      return [];
    }
  }

  // Get current chain ID
  async getChainId(): Promise<string> {
    try {
      if (!this.suiProvider) {
        throw new Error("Slush provider not available");
      }

      const chain = await this.suiProvider.getChain();
      return chain || "sui:mainnet"; // Slush defaults to mainnet
    } catch (error) {
      console.error("Error getting chain ID:", error);
      // Return mainnet as default for Slush
      return "sui:mainnet";
    }
  }

  // Setup event listeners for Slush wallet
  async setupEventListeners(): Promise<void> {
    if (!this.suiProvider || this.eventListenersSetup) {
      return;
    }

    try {
      // Account change events
      this.suiProvider.on("accountChange", (...args: unknown[]) => {
        const event = args[0] as { accounts: string[] };
        this.handleAccountChange(event);
      });

      // Chain/Network change events
      this.suiProvider.on("chainChange", (...args: unknown[]) => {
        const event = args[0] as { chain: string };
        this.handleChainChange(event);
      });

      // Connect events
      this.suiProvider.on("connect", (...args: unknown[]) => {
        const event = args[0] as { accounts: string[] };
        this.handleConnect(event);
      });

      // Disconnect events
      this.suiProvider.on("disconnect", () => {
        this.handleDisconnect();
      });

      this.eventListenersSetup = true;
    } catch (error) {
      console.error("Error setting up Slush event listeners:", error);
    }
  }

  // Remove event listeners
  private removeEventListeners(): void {
    if (!this.suiProvider || !this.eventListenersSetup) {
      return;
    }

    try {
      this.suiProvider.off("accountChange", (...args: unknown[]) => {
        const event = args[0] as { accounts: string[] };
        this.handleAccountChange(event);
      });
      this.suiProvider.off("chainChange", (...args: unknown[]) => {
        const event = args[0] as { chain: string };
        this.handleChainChange(event);
      });
      this.suiProvider.off("connect", (...args: unknown[]) => {
        const event = args[0] as { accounts: string[] };
        this.handleConnect(event);
      });
      this.suiProvider.off("disconnect", () => {
        this.handleDisconnect();
      });

      this.eventListenersSetup = false;
    } catch (error) {
      console.error("Error removing Slush event listeners:", error);
    }
  }

  // Get Slush provider from window
  private getSlushProvider(): SuiProvider | null {
    try {
      if (typeof window === "undefined") {
        return null;
      }

      // Slush wallet primarily uses window.sui
      if (window.sui) {
        // Verify it's actually Slush and not another wallet
        const provider = window.sui;

        // Check for Slush-specific identifiers
        if (
          provider.name === "Slush" ||
          provider.name === "Slush Wallet" ||
          (provider as unknown as { isSlush?: boolean }).isSlush
        ) {
          return provider;
        }

        // If no specific name but has required methods, assume it's Slush
        if (
          !provider.name &&
          typeof provider.requestAccount === "function" &&
          typeof provider.getAccounts === "function"
        ) {
          return provider;
        }
      }

      return null;
    } catch (error) {
      console.error("Error accessing Slush provider:", error);
      return null;
    }
  }

  // Event handlers
  private async handleAccountChange(event: {
    accounts: string[];
  }): Promise<void> {
    try {
      const accounts = event.accounts || [];
      await this.handleEventAccountChanged(accounts);
    } catch (error) {
      console.error("Error handling account change:", error);
    }
  }

  private async handleChainChange(event: { chain: string }): Promise<void> {
    try {
      const chainId = event.chain || "sui:mainnet";
      await this.handleEventChainChanged(chainId);
    } catch (error) {
      console.error("Error handling chain change:", error);
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
      console.error("Error handling connect event:", error);
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
      console.error("Error handling disconnect event:", error);
    }
  }

  // Additional Slush-specific methods

  // Get Slush wallet info
  getWalletInfo(): { name: string; icon?: string } {
    return {
      name: this.suiProvider?.name || "Slush",
      icon: this.suiProvider?.icon || this.logo,
    };
  }

  // Check if currently connected to Slush
  isConnected(): boolean {
    return super.isConnected() && !!this.suiProvider;
  }

  // Get Slush version (if available)
  getWalletVersion(): string | undefined {
    try {
      return (this.suiProvider as unknown as { version?: string })?.version;
    } catch {
      return undefined;
    }
  }

  // Slush-specific features

  // Check if this is actually Slush wallet
  isSlushWallet(): boolean {
    if (!this.suiProvider) return false;

    return !!(
      this.suiProvider.name === "Slush" ||
      this.suiProvider.name === "Slush Wallet" ||
      (this.suiProvider as unknown as { isSlush?: boolean }).isSlush
    );
  }

  // Get Slush-specific features (if any)
  getSlushFeatures(): {
    hasStaking?: boolean;
    hasNFTs?: boolean;
    hasDefi?: boolean;
  } {
    try {
      const features = (
        this.suiProvider as unknown as { features?: Record<string, boolean> }
      )?.features;
      return {
        hasStaking: features?.staking || true, // Assume Slush has staking
        hasNFTs: features?.nfts || true, // Assume Slush has NFT support
        hasDefi: features?.defi || true, // Assume Slush has DeFi support
      };
    } catch {
      return {
        hasStaking: true,
        hasNFTs: true,
        hasDefi: true,
      };
    }
  }
}
