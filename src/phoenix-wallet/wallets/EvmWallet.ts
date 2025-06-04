import { JsonRpcSigner, Wallet as EthersWallet } from "ethers";
import { IWallet, Wallet } from "./IWallet";
import { EvmChain } from "../chains/EvmChain";
import { EvmConnector } from "../connectors";

export interface EvmTransaction {
    to: string;
    value: string;
    data: string;
    gasLimit?: string;
  }
  
  export class EvmWallet extends Wallet<EvmTransaction, EvmChain, EvmConnector> {
    constructor(_address: string, chain: EvmChain, connector: EvmConnector) {
        super(_address, chain, connector);
    }
  
    async signTransaction(transaction: EvmTransaction): Promise<string> {
    //   return await this.signer.signTransaction({
    //     to: transaction.to,
    //     value: transaction.value,
    //     data: transaction.data,
    //     gasLimit: transaction.gasLimit,
    //   });
        return "";
    }
    async signMessage(message: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    get address(): string {
        return this._address;
    }
  }