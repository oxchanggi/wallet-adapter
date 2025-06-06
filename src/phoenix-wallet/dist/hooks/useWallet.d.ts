import { IChain } from '../chains/Chain';
import { IConnector } from '../connectors/IConnector';
import { ConnectorStatus } from '../connectors/types';
import { IWallet } from '../wallets/IWallet';
interface WalletState {
  connector: IConnector | null;
  status: ConnectorStatus;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  hasError: boolean;
  isInstalled: boolean | null;
  address: string | null;
  chainId: string | null;
  connect: () => Promise<any>;
  disconnect: () => Promise<void>;
  switchChain: (chainId: string) => Promise<void>;
  wallet: IWallet<any, IChain<any>, IConnector, any> | null;
}
/**
 * Hook to interact with a specific wallet connector
 *
 * @param connectorId The connector ID to use
 * @returns Connector-specific state and methods
 */
export declare function useWallet(connectorId: string): WalletState;
export {};
