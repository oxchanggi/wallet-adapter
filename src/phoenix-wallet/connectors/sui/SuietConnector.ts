import { ConnectorConfig, DappMetadata } from "../types";
import { SuiConnector, SuiProvider } from "./SuiConnector";

export class SuietConnector extends SuiConnector {
  private suiProvider: SuiProvider | null = null;
  private eventListenersSetup = false;

  constructor(config: ConnectorConfig, dappMetadata: DappMetadata) {
    super("suiet", config, dappMetadata);
  }

  // Check if Suiet wallet is installed
  async isInstalled(): Promise<boolean> {
    try {
      if (typeof window === "undefined") {
        return false;
      }

      // Check for Suiet provider in multiple possible locations
      const hasSuiet = !!(
        window.suiet?.sui ||
        (window.sui && window.sui.name === "Suiet") ||
        // Some versions might expose directly
        (window as unknown as { suiet?: SuiProvider }).suiet
      );

      return hasSuiet;
    } catch (error) {
      console.error("Error checking Suiet installation:", error);
      return false;
    }
  }

  // Initialize connection to Suiet wallet
  async connect(): Promise<{ address: string; chainId: string }> {
    try {
      if (!(await this.isInstalled())) {
        throw new Error(
          "Suiet wallet is not installed. Please install Suiet wallet extension."
        );
      }

      // Get Suiet provider
      this.suiProvider = this.getSuietProvider();
      if (!this.suiProvider) {
        throw new Error("Failed to access Suiet provider");
      }

      this.provider = this.suiProvider;

      // Setup event listeners before connecting
      await this.setupEventListeners();

      // Request connection
      const connectResult = await this.suiProvider.requestAccount();

      if (!connectResult.accounts || connectResult.accounts.length === 0) {
        throw new Error("No accounts returned from Suiet wallet");
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
      console.error("Error connecting to Suiet:", error);
      throw error;
    }
  }

  // Disconnect from Suiet wallet
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
      console.error("Error disconnecting from Suiet:", error);
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
        throw new Error("Suiet provider not available");
      }

      const chain = await this.suiProvider.getChain();
      return chain || "sui:devnet"; // Default fallback
    } catch (error) {
      console.error("Error getting chain ID:", error);
      // Return default network if error
      return "sui:devnet";
    }
  }

  // Setup event listeners for Suiet wallet
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
      console.error("Error setting up Suiet event listeners:", error);
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
      console.error("Error removing Suiet event listeners:", error);
    }
  }

  // Get Suiet provider from window
  private getSuietProvider(): SuiProvider | null {
    try {
      if (typeof window === "undefined") {
        return null;
      }

      // Try different possible locations for Suiet provider
      if (window.suiet?.sui) {
        return window.suiet.sui;
      }

      // Check if window.sui is Suiet
      if (window.sui && window.sui.name === "Suiet") {
        return window.sui;
      }

      // Check direct suiet property (some versions)
      const directSuiet = (window as unknown as { suiet?: SuiProvider }).suiet;
      if (directSuiet && typeof directSuiet.requestAccount === "function") {
        return directSuiet;
      }

      return null;
    } catch (error) {
      console.error("Error accessing Suiet provider:", error);
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
      const chainId = event.chain || "sui:devnet";
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

  // Additional Suiet-specific methods

  // Get Suiet wallet info
  getWalletInfo(): { name: string; icon?: string } {
    return {
      name: this.suiProvider?.name || "Suiet",
      icon: this.suiProvider?.icon || this.logo,
    };
  }

  // Check if currently connected to Suiet
  isConnected(): boolean {
    return super.isConnected() && !!this.suiProvider;
  }

  // Get Suiet version (if available)
  getWalletVersion(): string | undefined {
    try {
      return (this.suiProvider as unknown as { version?: string })?.version;
    } catch {
      return undefined;
    }
  }
}
