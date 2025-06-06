import { ethers, isAddress } from 'ethers';
import { EvmWallet } from '../wallets/EvmWallet';
import { Contract } from './IContract';
import { Client, getContract, PublicClient } from 'viem';
import { isValidAbi } from '../utils/contract';

export class EvmContract extends Contract {
  protected abi: any;
  protected publicClient: PublicClient;
  constructor(publicClient: PublicClient, address: string, abi: any) {
    super(address);
    this.abi = abi;
    //check abi is valid
    if (!isValidAbi(abi)) {
      throw new Error('Invalid ABI');
    }

    if (!isAddress(address)) {
      throw new Error('Invalid address');
    }
    this.publicClient = publicClient;
  }

  async initialize(): Promise<void> {
    return Promise.resolve();
  }

  get contract(): any {
    let client: { public: Client; wallet: any } = {
      public: this.publicClient,
      wallet: null,
    };
    if (this.wallet) {
      client = {
        public: this.publicClient,
        wallet: this.wallet.walletClient,
      };
    }
    return getContract({
      address: this.address as `0x${string}`,
      abi: this.abi,
      client,
    });
  }

  async waitTransaction(txHash: string): Promise<any> {
    return await this.publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
      confirmations: 1,
    });
  }
}
