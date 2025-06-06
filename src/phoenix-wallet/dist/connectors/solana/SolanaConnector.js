import { Connector } from '../IConnector';
import { ChainType } from '../../chains/Chain';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { SolanaWalletClient } from './SolanaWalletClient';
import { Connection } from '@solana/web3.js';
function convertWalletNameToId(name) {
  return (name + '_solana').toLowerCase().replace(' ', '_');
}
export var SolanaCluster;
(function (SolanaCluster) {
  SolanaCluster['MAINNET'] = 'mainnet-beta';
  SolanaCluster['DEVNET'] = 'devnet';
  SolanaCluster['TESTNET'] = 'testnet';
  SolanaCluster['LOCALNET'] = 'localnet';
})(SolanaCluster || (SolanaCluster = {}));
export class SolanaConnector extends Connector {
  constructor(dappMetadata, adapter, defaultCluster = SolanaCluster.MAINNET) {
    super(convertWalletNameToId(adapter.name), adapter.name, adapter.icon, dappMetadata);
    this.activeAddress = undefined;
    this.isInitialized = false;
    this.adapter = adapter;
    this.cluster = defaultCluster;
  }
  async init() {
    if (!this.adapter) {
      throw new Error(this.name + ' adapter not found');
    }
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    this.setupEventListeners();
    // Check if we have a stored connection
    this.checkStoredConnection();
  }
  async isInstalled() {
    await this.init();
    return this.adapter.readyState == WalletReadyState.Installed;
  }
  get chainType() {
    return ChainType.SOLANA;
  }
  async connect() {
    await this.init();
    console.log('Connecting to Solana');
    try {
      await this.adapter.connect();
    } catch (error) {
      // await this.disconnect();
      throw error;
    }
    this.activeAddress = this.adapter.publicKey?.toBase58() ?? '';
    // Store connection status in localStorage
    if (typeof localStorage !== 'undefined') {
      if (this.storageConnectionStatusKey) {
        localStorage.setItem(this.storageConnectionStatusKey, 'connected');
      }
      if (this.storageAddressKey && this.activeAddress) {
        localStorage.setItem(this.storageAddressKey, this.activeAddress);
      }
    }
    return {
      address: this.activeAddress,
      chainId: this.cluster,
    };
  }
  async disconnect() {
    await this.init();
    // Store the current address before clearing it
    const currentAddress = this.activeAddress;
    // Clear the active address
    this.activeAddress = undefined;
    // Remove stored connection info
    if (typeof localStorage !== 'undefined') {
      if (this.storageConnectionStatusKey) {
        localStorage.removeItem(this.storageConnectionStatusKey);
      }
      if (this.storageAddressKey) {
        localStorage.removeItem(this.storageAddressKey);
      }
    }
    await this.adapter.disconnect();
    // Emit disconnect event if we had an active address
    if (currentAddress) {
      this.handleEventDisconnect(currentAddress);
    }
  }
  async getConnectedAddresses() {
    await this.init();
    return [this.adapter.publicKey?.toBase58() ?? ''];
  }
  get _chainId() {
    return 'solana_' + this.cluster.toLowerCase().replace('-', '_');
  }
  async getChainId() {
    return this._chainId;
  }
  async setupEventListeners() {
    if (!(await this.isInstalled())) return;
    this.adapter.on('connect', () => {
      console.log('Solana connector connect event', this.adapter.publicKey?.toBase58());
      if (this.activeAddress != this.adapter.publicKey?.toBase58() && this.adapter.publicKey?.toBase58()) {
        this.activeAddress = this.adapter.publicKey?.toBase58();
        this.handleEventConnect(this.activeAddress, this._chainId);
      }
    });
    this.adapter.on('disconnect', () => {
      if (this.activeAddress) {
        this.handleEventDisconnect(this.activeAddress);
        this.activeAddress = undefined;
      }
    });
  }
  //This function should check if the wallet is connected to the chain, and when application is reloaded, it should check if the wallet is connected to the chain
  async isConnected() {
    try {
      await this.init();
      if (this.storageConnectionStatusKey) {
        const storedStatus = localStorage.getItem(this.storageConnectionStatusKey);
        if (!storedStatus) {
          return false;
        }
      }
      if (this.activeAddress) {
        return true;
      }
      return !!this.adapter.publicKey;
    } catch (error) {
      console.error(`Error checking if ${this.id} is connected:`, error);
      return false;
    }
  }
  createWalletClient(chain) {
    if (!this.adapter) {
      throw new Error('Solana adapter not found');
    }
    return new SolanaWalletClient(this.adapter);
  }
  createPublicClient(chain) {
    return new Connection(chain.publicRpcUrl);
  }
  get installLink() {
    if (!this.adapter) {
      throw new Error('Solana adapter not found');
    }
    return this.adapter.url;
  }
  async switchChainId(chainId) {
    this.cluster = chainId;
    this.handleEventChainChanged(chainId);
  }
  async addChain(chain) {
    throw new Error('Method not supported for Solana.');
  }
  get storageConnectionStatusKey() {
    return `phoenix_${this.id}_solana_connection_status`;
  }
  get storageAddressKey() {
    return `phoenix_${this.id}_solana_address`;
  }
  checkStoredConnection() {
    if (typeof localStorage !== 'undefined' && this.storageConnectionStatusKey) {
      const storedStatus = localStorage.getItem(this.storageConnectionStatusKey);
      if (storedStatus === 'connected') {
        // Check if we have a stored address
        if (this.storageAddressKey) {
          const storedAddress = localStorage.getItem(this.storageAddressKey);
          if (storedAddress) {
            this.activeAddress = storedAddress;
            this.handleEventConnect(this.activeAddress, this._chainId);
          } else {
            localStorage.removeItem(this.storageConnectionStatusKey);
          }
        }
      }
    }
  }
}
//# sourceMappingURL=SolanaConnector.js.map
