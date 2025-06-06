import { DappMetadata } from '../types';
import { EvmConnector } from './EvmConnector';
export declare class RainbowEvmConnector extends EvmConnector {
  constructor(dappMetadata: DappMetadata);
  get provider(): any;
  isInstalled(): Promise<boolean>;
  get installLink(): string;
}
declare global {
  interface Window {
    rainbow?: any;
  }
}
