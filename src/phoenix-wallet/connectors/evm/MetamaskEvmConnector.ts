import { EvmConnector } from "./EvmConnector";
import { MetaMaskSDK, MetaMaskSDKOptions } from "@metamask/sdk";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { EvmWallet, EvmTransaction } from "../../wallets/EvmWallet";
import { EvmChain } from "../../chains/EvmChain";
import { IChain, ChainType } from "../../chains/Chain";
import { DappMetadata } from "../types";

export class MetamaskEvmConnector extends EvmConnector {
  private sdk: MetaMaskSDK | null = null;

  constructor(dappMetadata: DappMetadata) {
    super(
      "metamaskevm",
      {
        name: "Metamask",
        logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
      },
      dappMetadata
    );
  }

  get provider(): any {
    return this.sdk?.getProvider();
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
    super.init();
  }

  async isInstalled(): Promise<boolean> {
    // Check if window.ethereum exists and if it has the isMetaMask property
    if (typeof window !== "undefined" && window.ethereum) {
      return Boolean(window.ethereum.isMetaMask);
    }
    return false;
  }

  async disconnect(): Promise<void> {
    await this.sdk?.terminate();
  }
}
