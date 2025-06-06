import { DappMetadata } from '../types';
import { EvmConnector } from './EvmConnector';
export declare class PhantomEvmConnector extends EvmConnector {
  constructor(dappMetadata: DappMetadata);
  get provider(): any;
  isInstalled(): Promise<boolean>;
  get installLink(): string;
}
