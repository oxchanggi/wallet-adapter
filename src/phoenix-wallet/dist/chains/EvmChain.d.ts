import { JsonRpcProvider } from 'ethers';
import { Chain, ChainType, IChain } from './Chain';
export declare class EvmChain extends Chain<JsonRpcProvider> {
  private _chainName;
  private _provider;
  constructor(chainName: string, config: IChain<JsonRpcProvider>);
  get chainName(): string;
  get chainType(): ChainType;
  get provider(): JsonRpcProvider;
}
