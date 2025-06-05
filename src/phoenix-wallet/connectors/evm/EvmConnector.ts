import { BrowserProvider, id, JsonRpcSigner, Wallet } from "ethers";
import { ConnectorConfig, ConnectorInterface, ConnectorState, DappMetadata } from "../types";
import { IWallet } from "../../wallets/IWallet";
import { EvmTransaction } from "../../wallets/EvmWallet";
import { Connector } from "../IConnector";
import { Chain, ChainType, IChain } from "../../chains/Chain";
import { createWalletClient, custom } from "viem";
import { EvmChain } from "../../chains/EvmChain";

export abstract class EvmConnector extends Connector {
  protected activeAddress: string | undefined = undefined;
  protected activeChainId: string | undefined = undefined;
  protected provider: any = null;

  constructor(id: string, config: ConnectorConfig, dappMetadata: DappMetadata) {
    super(id, config.name, config.logo, dappMetadata);
  }

  get chainType(): ChainType {
    return ChainType.EVM;
  }

  async isConnected(): Promise<boolean> {
    try {
      if (this.activeAddress) {
        return true;
      }

      const addresses = await this.getConnectedAddresses().catch(() => []);
      console.log(addresses);
      return addresses.length > 0;
    } catch (error) {
      console.error(`Error checking if ${this.id} is connected:`, error);
      return false;
    }
  }

  async handleEventAccountChanged(addresses: string[]): Promise<void> {
    if (addresses.length === 0) {
      if (this.activeAddress) {
        this.handleEventDisconnect(this.activeAddress);
        this.activeAddress = undefined;
        this.activeChainId = undefined;
      }
    } else {
      if (this.activeAddress != addresses[0]) {
        this.activeAddress = addresses[0];
        this.activeChainId = await this.getChainId();
        this.handleEventConnect(this.activeAddress, this.activeChainId);
      }
    }
    super.handleEventAccountChanged(addresses);
  }

  abstract init(): Promise<void> 

  async setupEventListeners(): Promise<void> {
    if (!this.provider) {
      throw new Error(this.name+" provider not available");
    }
    
    this.provider.on('accountsChanged', (accounts: string[]) => {
      this.handleEventAccountChanged(accounts);
    });
    
    this.provider.on('chainChanged', (chainId: string) => {
      this.activeChainId = chainId;
      this.handleEventChainChanged(chainId);
    });
  }

  async getConnectedAddresses(): Promise<string[]> {
    await this.init();
    const accounts = await this.provider?.request({ method: 'eth_accounts' }) as string[];
    if (!accounts) {
      return []
    }
    return accounts;
  }

  async getChainId(): Promise<string> {
    const chainIdHex = await this.provider?.request({ method: 'eth_chainId' });
    // Convert hex string to number and then back to string
    return chainIdHex ? parseInt(chainIdHex.toString(), 16).toString() : '0';
  }

  createWalletClient(chain: EvmChain) {
    const client = createWalletClient({
      chain: {
        blockExplorers: {
          default: {
            name: chain.chainName,
            url: chain.explorerUrl
          }
        },
        id: parseInt(this.activeChainId!),
        name: chain.chainName,
        nativeCurrency: {
          name: chain.chainName,
          symbol: chain.chainName,
          decimals: 18
        },
        rpcUrls: {
          default: {
            http: [chain.privateRpcUrl]
          }
        }
      },
      transport: custom(this.provider)
    })
    
    return client;
  }

  async connect(): Promise<{ address: string, chainId: string }> {
    try {
      if (!this.provider) {
        await this.init();
      }

      if (!this.provider) {
        throw new Error(this.name+" provider not available");
      }

      // Request accounts
      const accounts = await this.provider?.request({ method: 'eth_requestAccounts' }) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      this.activeChainId = await this.getChainId();

      if (this.activeAddress != accounts[0]) {
        this.activeAddress = accounts[0];
        this.handleEventConnect(this.activeAddress, this.activeChainId);
      }

      return { address: this.activeAddress, chainId: this.activeChainId };
      // Create and return the wallet
    } catch (error: any) {
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    // No direct disconnect method in EIP-1193, but we can clear our local state
    if (this.activeAddress) {
        this.handleEventDisconnect(this.activeAddress);
        this.activeAddress = undefined;
        this.activeChainId = undefined;
    }
}
}

// Ensure TypeScript recognizes the ethereum property on window
declare global {
  interface Window {
    ethereum?: any;
    phantom?: any;
  }
} 