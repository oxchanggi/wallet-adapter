import { Contract } from './IContract';
import { PublicClient } from 'viem';
export declare class EvmContract extends Contract {
  protected abi: any;
  protected publicClient: PublicClient;
  constructor(publicClient: PublicClient, address: string, abi: any);
  initialize(): Promise<void>;
  get contract(): any;
  waitTransaction(txHash: string): Promise<any>;
}
