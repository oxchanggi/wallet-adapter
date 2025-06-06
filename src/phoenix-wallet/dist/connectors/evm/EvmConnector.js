import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { ChainType } from '../../chains/Chain';
import { Connector } from '../IConnector';
export class EvmConnector extends Connector {
  constructor(id, config, dappMetadata) {
    super(id, config.name, config.logo, dappMetadata);
    this.activeAddress = undefined;
    this.activeChainId = undefined;
    this.isInitialized = false;
  }
  get chainType() {
    return ChainType.EVM;
  }
  async init() {
    if (!this.provider) {
      throw new Error(this.name + ' provider not found');
    }
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    console.log('init', this.isInitialized);
    this.setupEventListeners();
    // Check if we have a stored connection
    this.checkStoredConnection();
  }
  async isConnected() {
    try {
      if (this.storageConnectionStatusKey) {
        const storedStatus = localStorage.getItem(this.storageConnectionStatusKey);
        if (!storedStatus) {
          return false;
        }
      }
      if (this.activeAddress) {
        return true;
      }
      const addresses = await this.getConnectedAddresses().catch(() => []);
      return addresses.length > 0;
    } catch (error) {
      console.error(`Error checking if ${this.id} is connected:`, error);
      return false;
    }
  }
  async handleEventAccountChanged(addresses) {
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
  async setupEventListeners() {
    if (!this.provider) {
      throw new Error(this.name + ' provider not available');
    }
    this.provider.on('accountsChanged', (accounts) => {
      this.handleEventAccountChanged(accounts);
    });
    this.provider.on('chainChanged', (chainId) => {
      this.activeChainId = chainId;
      this.handleEventChainChanged(chainId);
    });
    this.provider.on('disconnect', () => {
      if (this.activeAddress) {
        this.handleEventDisconnect(this.activeAddress);
        this.activeAddress = undefined;
        this.activeChainId = undefined;
      }
    });
  }
  async getConnectedAddresses() {
    await this.init();
    const accounts = await this.provider?.request({ method: 'eth_accounts' });
    if (!accounts) {
      return [];
    }
    return accounts;
  }
  async getChainId() {
    const chainIdHex = await this.provider?.request({ method: 'eth_chainId' });
    // Convert hex string to number and then back to string
    return chainIdHex ? parseInt(chainIdHex.toString(), 16).toString() : '0';
  }
  createWalletClient(chain) {
    const client = createWalletClient({
      chain: {
        blockExplorers: {
          default: {
            name: chain.chainName,
            url: chain.explorerUrl,
          },
        },
        id: parseInt(this.activeChainId),
        name: chain.chainName,
        nativeCurrency: {
          name: chain.nativeCurrency.name,
          symbol: chain.nativeCurrency.symbol,
          decimals: chain.nativeCurrency.decimals,
        },
        rpcUrls: {
          default: {
            http: [chain.publicRpcUrl],
          },
        },
      },
      transport: custom(this.provider),
    });
    return client;
  }
  createPublicClient(chain) {
    const client = createPublicClient({
      chain: {
        blockExplorers: {
          default: {
            name: chain.chainName,
            url: chain.explorerUrl,
          },
        },
        id: parseInt(this.activeChainId),
        name: chain.chainName,
        nativeCurrency: {
          name: chain.nativeCurrency.name,
          symbol: chain.nativeCurrency.symbol,
          decimals: chain.nativeCurrency.decimals,
        },
        rpcUrls: {
          default: {
            http: [chain.privateRpcUrl],
          },
        },
      },
      transport: http(chain.privateRpcUrl),
    });
    return client;
  }
  async connect() {
    try {
      if (!this.provider) {
        await this.init();
      }
      if (!this.provider) {
        throw new Error(this.name + ' provider not available');
      }
      // Request accounts
      const accounts = await this.provider?.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      this.activeChainId = await this.getChainId();
      if (this.activeAddress != accounts[0]) {
        this.activeAddress = accounts[0];
        this.handleEventConnect(this.activeAddress, this.activeChainId);
      }
      // Store connection status in localStorage
      if (typeof localStorage !== 'undefined' && this.storageConnectionStatusKey) {
        localStorage.setItem(this.storageConnectionStatusKey, 'connected');
      }
      return { address: this.activeAddress, chainId: this.activeChainId };
      // Create and return the wallet
    } catch (error) {
      throw error;
    }
  }
  get storageConnectionStatusKey() {
    return `phoenix_${this.id}_evm_connection_status`;
  }
  checkStoredConnection() {
    if (typeof localStorage !== 'undefined' && this.storageConnectionStatusKey) {
      const storedStatus = localStorage.getItem(this.storageConnectionStatusKey);
      if (storedStatus === 'connected') {
        // Attempt to reconnect based on stored state
        this.getConnectedAddresses()
          .then((addresses) => {
            if (addresses.length > 0) {
              this.activeAddress = addresses[0];
              this.getChainId().then((chainId) => {
                this.activeChainId = chainId;
                this.handleEventConnect(this.activeAddress, this.activeChainId);
              });
            } else {
              // Clear stored connection if no addresses found
              localStorage.removeItem(this.storageConnectionStatusKey);
            }
          })
          .catch(() => {
            localStorage.removeItem(this.storageConnectionStatusKey);
          });
      }
    }
  }
  async disconnect() {
    // Store the current address before clearing it
    const currentAddress = this.activeAddress;
    // Clear the active address and chain ID
    this.activeAddress = undefined;
    this.activeChainId = undefined;
    // Remove the connection status from localStorage
    if (typeof localStorage !== 'undefined' && this.storageConnectionStatusKey) {
      localStorage.removeItem(this.storageConnectionStatusKey);
    }
    // Emit the disconnect event if we have a provider and had an active address
    if (this.provider && currentAddress) {
      this.handleEventDisconnect(currentAddress);
    }
  }
  async switchChainId(chainId) {
    await this.provider?.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chainId }] });
  }
  async addChain(chain) {
    return await this.provider?.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${chain.chainId.toString(16)}`,
          chainName: chain.chainName,
          nativeCurrency: {
            name: chain.nativeCurrency.name,
            symbol: chain.nativeCurrency.symbol,
            decimals: chain.nativeCurrency.decimals,
          },
          rpcUrls: [chain.publicRpcUrl],
          blockExplorerUrls: [chain.explorerUrl],
        },
      ],
    });
  }
}
//# sourceMappingURL=EvmConnector.js.map
