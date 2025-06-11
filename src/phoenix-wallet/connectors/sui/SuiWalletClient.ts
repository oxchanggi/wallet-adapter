import { SuiProvider } from './SuiConnector';
import {
  SuiTransactionResponse,
  SuiSignedTransaction,
  SuiSignedMessage,
  SuiSignTransactionBlockInput,
  SuiSignAndExecuteTransactionBlockInput,
} from '../../types/sui';

export class SuiWalletClient {
  private _provider: SuiProvider;

  constructor(suiProvider: SuiProvider) {
    this._provider = suiProvider;
  }

  signTransaction(input: SuiSignTransactionBlockInput): Promise<SuiSignedTransaction> {
    console.log('signTransaction', input);
    return this._provider.signTransaction(input);
  }

  signAndExecuteTransactionBlock(input: SuiSignAndExecuteTransactionBlockInput): Promise<SuiTransactionResponse> {
    console.log('signAndExecuteTransactionBlock', input);
    return this._provider.signAndExecuteTransactionBlock(input);
  }

  signMessage(message: Uint8Array, account?: string): Promise<SuiSignedMessage> {
    console.log('signMessage', message, account);
    return this._provider.signMessage(message, account);
  }

  // Get accounts from provider
  getAccounts(): Promise<string[]> {
    return this._provider.getAccounts();
  }

  // Get current chain
  getChain(): Promise<string> {
    return this._provider.getChain();
  }

  // Request account connection
  requestAccount() {
    return this._provider.requestAccount();
  }

  // Disconnect from wallet
  disconnect(): Promise<void> {
    return this._provider.disconnect();
  }
}
