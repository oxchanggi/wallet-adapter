import { IConnector } from '@/phoenix-wallet/connectors/IConnector';

import { IChain } from '@/phoenix-wallet/chains/Chain';

import { IWallet } from '@/phoenix-wallet/wallets/IWallet';

export interface ResponseTransacton {
  txHash: string;
  wait(): Promise<void>;
}
export interface ITokenContract {
  set wallet(wallet: IWallet<any, any, any, any> | undefined); // always defined in Contract
  getBalance(address: string): Promise<{ amount: string; uiAmount: string }>;
  getAllowance(address: string, spender: string): Promise<string>;
  getDecimals(): Promise<number>;
  getSymbol(): Promise<string>;
  getTotalSupply(): Promise<string>;
  transfer(to: string, amount: string): Promise<ResponseTransacton>;
}
