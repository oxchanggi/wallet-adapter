import { DappMetadata } from '../types';
import { EvmConnector } from './EvmConnector';
export declare class MetamaskEvmConnector extends EvmConnector {
  private sdk;
  constructor(dappMetadata: DappMetadata);
  get provider(): any;
  init(): Promise<void>;
  isInstalled(): Promise<boolean>;
  disconnect(): Promise<void>;
  get installLink(): string;
}
