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
}

// Ensure TypeScript recognizes the ethereum property on window
declare global {
  interface Window {
    ethereum?: any;
    phantom?: any;
  }
} 