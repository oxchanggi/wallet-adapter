import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { IWallet, Wallet } from "./IWallet";
import { Chain } from "../chains/Chain";
import { SolanaChain } from "../chains/SolanaChain";
import { SolanaConnector } from "../connectors/solana/SolanaConnector";

export type SolanaTransaction = Transaction | VersionedTransaction;

export class SolanaWallet extends Wallet<SolanaTransaction, SolanaChain, SolanaConnector> {
  private provider: any;

  constructor(_address: string, chain: SolanaChain, connector: SolanaConnector) {
    super(_address, chain, connector);
}

  async signMessage(message: string): Promise<string> {
    const encodedMessage = new TextEncoder().encode(message);
    const signedMessage = await this.provider.signMessage(encodedMessage, "utf8");
    return Buffer.from(signedMessage.signature).toString("hex");
  }

  async signTransaction(transaction: SolanaTransaction): Promise<string> {
    let signedTransaction;

    if ('signatures' in transaction && !('message' in transaction)) {
      signedTransaction = await this.provider.signTransaction(transaction);
      return signedTransaction.serialize().toString("hex");
    } else if ('message' in transaction) {
      signedTransaction = await this.provider.signTransaction(transaction);
      return Buffer.from(signedTransaction.serialize()).toString("hex");
    }

    throw new Error("Unsupported transaction type");
  }

  get address(): string {
    return this._address;
  }
}