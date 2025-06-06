import { Connection } from '@solana/web3.js';
import { Chain, ChainType, IChain } from './Chain';
export declare class SolanaChain extends Chain<Connection> {
  private _chainName;
  private _provider;
  constructor(chainName: string, config: IChain<Connection>);
  get chainName(): string;
  get chainType(): ChainType;
  get provider(): Connection;
}
