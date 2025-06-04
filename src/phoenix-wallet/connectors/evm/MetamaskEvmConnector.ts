import { EvmConnector } from "./EvmConnector";
import { MetaMaskSDK, MetaMaskSDKOptions } from '@metamask/sdk';
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { EvmWallet, EvmTransaction } from "../../wallets/EvmWallet";
import { EvmChain } from "../../chains/EvmChain";
import { IChain, ChainType } from "../../chains/Chain";
import { DappMetadata } from "../types";

export class MetamaskEvmConnector extends EvmConnector {
  private sdk: MetaMaskSDK | null = null;
  
  constructor(dappMetadata: DappMetadata) {
    super("metamaskevm", {
      name: "Metamask",
      logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    }, dappMetadata);
  }

  async init(): Promise<void> {
    if (this.sdk) {
      return;
    }
    this.sdk = new MetaMaskSDK({
      dappMetadata: {
        name: this.dappMetadata.name,
        url: this.dappMetadata.url,
      },
    });
    await this.sdk.init();
    this.setupEventListeners();

  }

  async isInstalled(): Promise<boolean> {
    // Check if window.ethereum exists and if it has the isMetaMask property
    if (typeof window !== 'undefined' && window.ethereum) {
      return Boolean(window.ethereum.isMetaMask);
    }
    return false;
  }

  async setupEventListeners(): Promise<void> {
    if (!this.sdk) {
      throw new Error("MetaMask not available");
    }
    const provider = this.sdk?.getProvider();
    if (!provider) {
      throw new Error("MetaMask provider not available");
    }
    //@ts-ignore
    provider.on('accountsChanged', (accounts: string[])=>{
      this.handleEventAccountChanged(accounts);
    });
    //@ts-ignore
    provider.on('chainChanged', (chainId: string)=>{
      this.handleEventChainChanged(chainId);
    });
  }
  async connect(): Promise<{address: string, chainId: string}> {
    try {
      if (!this.sdk) {
        await this.init();
      }
      
      const ethereum = this.sdk?.getProvider();
      if (!ethereum) {
        throw new Error("MetaMask provider not available");
      }

      this.provider = new BrowserProvider(ethereum);
      
      // Request accounts
      const accounts = await this.getConnectedAddresses();


      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      this.activeChainId = await this.getChainId();

      if (this.activeAddress != accounts[0]) {
        this.activeAddress = accounts[0];
        this.handleEventConnect(this.activeAddress, this.activeChainId);
      }

      
      return {address: this.activeAddress, chainId: this.activeChainId};
      // Create and return the wallet
    } catch (error: any) {
      throw error;
    }
  }
  
  async disconnect(): Promise<void> {
    await this.sdk?.terminate();
  }

  async getConnectedAddresses(): Promise<string[]> {
    const accounts = await this.sdk?.getProvider()?.request({ method: 'eth_requestAccounts' }) as string[];
    if (!accounts) {
      return []
    }
    return accounts;
  }

  async getChainId(): Promise<string> {
    const chainIdHex = await this.sdk?.getProvider()?.request({ method: 'eth_chainId' });
    // Convert hex string to number and then back to string
    return chainIdHex ? parseInt(chainIdHex.toString(), 16).toString() : '0';
  }
}