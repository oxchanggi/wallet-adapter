import { EvmConnector } from './EvmConnector';
import { DappMetadata } from '../types';
export declare class CoinbaseEvmConnector extends EvmConnector {
  constructor(dappMetadata: DappMetadata);
  get provider(): any;
  isInstalled(): Promise<boolean>;
  get installLink(): string;
}
declare global {
  interface Window {
    coinbaseWalletExtension?: any;
  }
}
