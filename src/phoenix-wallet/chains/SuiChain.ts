import { Chain, ChainType, IChain } from "./Chain";
import { SuiClient } from "@mysten/sui/client";

export class SuiChain extends Chain<SuiClient> {
  private _chainName: string;
  private _provider: SuiClient;

  constructor(chainName: string, config: IChain<SuiClient>) {
    super(config);
    this._chainName = chainName;
    if (!config.publicRpcUrl) {
      throw new Error(`RPC URL is required for ${chainName}`);
    }
    // Initialize official SuiClient
    this._provider = new SuiClient({
      url: config.publicRpcUrl,
    });
  }

  get chainName(): string {
    return this._chainName;
  }

  get chainType(): ChainType {
    return ChainType.SUI;
  }

  get provider(): SuiClient {
    return this._provider;
  }

  // Sui-specific helper methods
  get networkType(): string {
    if (this.id.includes("mainnet")) return "mainnet";
    if (this.id.includes("testnet")) return "testnet";
    if (this.id.includes("devnet")) return "devnet";
    return "unknown";
  }

  get chainIdentifier(): string {
    return `sui:${this.networkType}`;
  }

  // Sui-specific utility methods
  isMainnet(): boolean {
    return this.networkType === "mainnet";
  }

  isTestnet(): boolean {
    return this.networkType === "testnet";
  }

  isDevnet(): boolean {
    return this.networkType === "devnet";
  }

  // Get transaction explorer URL
  getTransactionUrl(txHash: string): string {
    return `${this.explorerUrl}/tx/${txHash}`;
  }

  // Get address explorer URL
  getAddressUrl(address: string): string {
    return `${this.explorerUrl}/address/${address}`;
  }
}
