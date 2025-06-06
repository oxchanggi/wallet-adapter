import { DappMetadata } from '../types';
import { EvmConnector } from './EvmConnector';
export declare class BinanceEvmConnector extends EvmConnector {
  private binanceProvider;
  constructor(dappMetadata: DappMetadata);
  get provider(): any;
  get installLink(): string;
  init(): Promise<void>;
  disconnect(): Promise<void>;
  get storageConnectionStatusKey(): string | null;
  isInstalled(): Promise<boolean>;
}
