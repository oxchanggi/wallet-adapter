import { Transaction } from '@mysten/sui/transactions';
import { Wallet } from './IWallet';
import { SuiChain } from '../chains/SuiChain';
import { SuiConnector } from '../connectors/sui/SuiConnector';
import { SuiWalletClient } from '../connectors/sui/SuiWalletClient';
import { SuiTransactionBlock } from '../types/sui';

// Sui Transaction Type
export type SuiTransaction = Transaction;

export class SuiWallet extends Wallet<SuiTransaction, SuiChain, SuiConnector, SuiWalletClient> {
  constructor(_address: string, chain: SuiChain, connector: SuiConnector, walletClient: SuiWalletClient) {
    super(_address, chain, connector, walletClient);
  }

  // Get provider through connector's public getter
  private get suiProvider() {
    return this.connector.getProvider();
  }

  // Convert Transaction to SuiTransactionBlock format
  private async convertToSuiTransactionBlock(transaction: SuiTransaction): Promise<SuiTransactionBlock> {
    // Build the transaction to get serialized format
    const builtTransaction = await transaction.toJSON();

    // Parse the built transaction to create SuiTransactionBlock
    return builtTransaction as any;
  }

  // Sign a transaction block without executing it
  async signTransaction(transaction: SuiTransaction): Promise<string> {
    try {
      // Get the provider from connector
      if (!this.suiProvider) {
        throw new Error('Sui provider not available');
      }

      const transactionBlock = await this.convertToSuiTransactionBlock(transaction);

      // Sign the transaction using the provider
      const signedTransaction = await this.suiProvider.signTransaction({
        transaction: transactionBlock,
        address: this._address,
        networkID: this.chain.chainIdentifier,
      });

      return signedTransaction.signature;
    } catch (error) {
      console.error('Error signing Sui transaction:', error);
      throw error;
    }
  }

  // Sign a message
  async signMessage(message: string): Promise<string> {
    try {
      if (!this.suiProvider) {
        throw new Error('Sui provider not available');
      }

      const signedMessage = await this.suiProvider.signMessage(new TextEncoder().encode(message), this._address);

      return signedMessage.signature;
    } catch (error) {
      console.error('Error signing Sui message:', error);
      throw error;
    }
  }

  // Get wallet address
  get address(): string {
    return this._address;
  }

  // Execute a transaction (sign and submit)
  async sendTransaction(transaction: SuiTransaction): Promise<string> {
    try {
      if (!this.suiProvider) {
        throw new Error('Sui provider not available');
      }

      const transactionBlock = await this.convertToSuiTransactionBlock(transaction);

      console.log('this.suiProvider', this.suiProvider);

      // Execute the transaction using the provider
      const result = await this.suiProvider.signAndExecuteTransaction({
        transaction: transactionBlock,
        address: this._address,
        networkID: this.chain.chainIdentifier,
        requestType: 'WaitForEffectsCert',
      });

      return result.digest;
    } catch (error) {
      console.error('Error sending Sui transaction:', error);
      throw error;
    }
  }

  // Send a pre-signed transaction
  async sendRawTransaction(signedTransactionBytes: string): Promise<string> {
    try {
      if (!this.suiProvider) {
        throw new Error('Sui provider not available');
      }

      const result = await this.chain.provider.executeTransactionBlock({
        transactionBlock: signedTransactionBytes,
        signature: signedTransactionBytes,
        requestType: 'WaitForEffectsCert',
      });

      return result.digest;
    } catch (error) {
      console.error('Error sending raw Sui transaction:', error);
      throw error;
    }
  }

  // Sign all transactions
  async signAllTransactions(transactions: SuiTransaction[]): Promise<string[]> {
    const signedTransactions: string[] = [];
    for (const transaction of transactions) {
      const signed = await this.signTransaction(transaction);
      signedTransactions.push(signed);
    }
    return signedTransactions;
  }

  // Get the Sui client instance
  get walletClient(): SuiWalletClient {
    return this._walletClient;
  }

  // Additional Sui-specific methods

  // Get account balance for native SUI
  async getBalance(): Promise<{ amount: string; uiAmount: string; decimals: number; symbol: string; name: string }> {
    try {
      const balance = await this.chain.provider.getBalance({
        owner: this._address,
        coinType: '0x2::sui::SUI',
      });

      const nativeCurrency = this.chain.nativeCurrency;
      const amount = balance.totalBalance;
      const uiAmount = (parseInt(amount) / Math.pow(10, nativeCurrency.decimals)).toString();

      return {
        amount: amount,
        uiAmount: uiAmount,
        decimals: nativeCurrency.decimals,
        symbol: nativeCurrency.symbol,
        name: nativeCurrency.name,
      };
    } catch (error) {
      console.error('Error getting Sui balance:', error);
      throw error;
    }
  }

  // Get balance for specific coin type
  async getBalanceForCoin(coinType: string = '0x2::sui::SUI'): Promise<string> {
    try {
      const balance = await this.chain.provider.getBalance({
        owner: this._address,
        coinType: coinType,
      });
      return balance.totalBalance;
    } catch (error) {
      console.error('Error getting Sui balance:', error);
      throw error;
    }
  }

  // Get all coin balances
  async getAllBalances(): Promise<Array<{ coinType: string; balance: string }>> {
    try {
      const balances = await this.chain.provider.getAllBalances({
        owner: this._address,
      });
      return balances.map((balance) => ({
        coinType: balance.coinType,
        balance: balance.totalBalance,
      }));
    } catch (error) {
      console.error('Error getting all Sui balances:', error);
      throw error;
    }
  }

  // Get owned objects with simpler filter
  async getOwnedObjects(options?: {
    filter?: {
      StructType?: string;
    };
    limit?: number;
  }) {
    try {
      const objects = await this.chain.provider.getOwnedObjects({
        owner: this._address,
        filter: options?.filter?.StructType ? { StructType: options.filter.StructType } : null,
        options: {
          showType: true,
          showOwner: true,
          showPreviousTransaction: true,
          showDisplay: true,
          showContent: true,
          showBcs: false,
        },
        limit: options?.limit || 50,
      });
      return objects.data;
    } catch (error) {
      console.error('Error getting owned Sui objects:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(limit: number = 20) {
    try {
      const transactions = await this.chain.provider.queryTransactionBlocks({
        filter: {
          FromAddress: this._address,
        },
        limit: limit,
        order: 'descending',
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      });
      return transactions.data;
    } catch (error) {
      console.error('Error getting Sui transaction history:', error);
      throw error;
    }
  }

  // Create a simple transfer transaction
  createTransferTransaction(to: string, amount: string): Transaction {
    const tx = new Transaction();

    // Split coins to get the exact amount
    const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);

    // Transfer the coin to recipient
    tx.transferObjects([coin], tx.pure.address(to));

    return tx;
  }

  // Estimate gas for a transaction
  async estimateGas(transaction: SuiTransaction): Promise<{
    computationCost: string;
    storageCost: string;
    storageRebate: string;
    totalGas: string;
  }> {
    try {
      // Dry run to estimate gas
      const dryRunResult = await this.chain.provider.dryRunTransactionBlock({
        transactionBlock: await transaction.build({ client: this.chain.provider }),
      });

      if (dryRunResult.effects.status.status === 'failure') {
        throw new Error(`Transaction would fail: ${dryRunResult.effects.status.error}`);
      }

      const gasUsed = dryRunResult.effects.gasUsed;
      const totalGas = BigInt(gasUsed.computationCost) + BigInt(gasUsed.storageCost) - BigInt(gasUsed.storageRebate);

      return {
        computationCost: gasUsed.computationCost,
        storageCost: gasUsed.storageCost,
        storageRebate: gasUsed.storageRebate,
        totalGas: totalGas.toString(),
      };
    } catch (error) {
      console.error('Error estimating Sui gas:', error);
      throw error;
    }
  }
}
