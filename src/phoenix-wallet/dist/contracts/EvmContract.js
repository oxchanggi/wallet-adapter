import { isAddress } from 'ethers';
import { Contract } from './IContract';
import { getContract } from 'viem';
import { isValidAbi } from '../utils/contract';
export class EvmContract extends Contract {
  constructor(publicClient, address, abi) {
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
  async initialize() {
    return Promise.resolve();
  }
  get contract() {
    let client = {
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
      address: this.address,
      abi: this.abi,
      client,
    });
  }
  async waitTransaction(txHash) {
    return await this.publicClient.waitForTransactionReceipt({
      hash: txHash,
      confirmations: 1,
    });
  }
}
//# sourceMappingURL=EvmContract.js.map
