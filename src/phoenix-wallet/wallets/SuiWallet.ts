import { Transaction } from '@mysten/sui/transactions';
import { Wallet } from './IWallet';
import { SuiChain } from '../chains/SuiChain';
import { SuiConnector } from '../connectors/sui/SuiConnector';
import { SuiWalletClient } from '../connectors/sui/SuiWalletClient';

// Sui Transaction Interface
export interface SuiTransaction {
  // Transaction Block (primary transaction type)
  transaction?: Transaction;

  // Simple transfer parameters
  to?: string;
  amount?: string;
  coinType?: string; // Default to SUI if not specified

  // Gas configuration
  gasBudget?: string;
  gasPayment?: string; // Object ID of gas coin

  // Additional options
  requestType?: 'WaitForEffectsCert' | 'WaitForLocalExecution';
  options?: {
    showInput?: boolean;
    showEffects?: boolean;
    showEvents?: boolean;
    showObjectChanges?: boolean;
    showBalanceChanges?: boolean;
  };
}

export class SuiWallet extends Wallet<SuiTransaction, SuiChain, SuiConnector, SuiWalletClient> {
  constructor(_address: string, chain: SuiChain, connector: SuiConnector, walletClient: SuiWalletClient) {
    super(_address, chain, connector, walletClient);
  }

  // Get provider through connector's public getter
  private get suiProvider() {
    return this.connector.getProvider();
  }

  // Sign a transaction block without executing it
  async signTransaction(transaction: SuiTransaction): Promise<string> {
    try {
      // Get the provider from connector
      if (!this.suiProvider) {
        throw new Error('Sui provider not available');
      }

      if (!transaction.amount && 'value' in transaction) {
        transaction.amount = (transaction as any).value;
      }

      let tx: Transaction;

      // Handle different transaction types
      if (transaction.transaction) {
        // Use provided transaction block
        tx = transaction.transaction;
      } else if (transaction.to && transaction.amount) {
        // Create simple transfer transaction
        tx = new Transaction();

        // Set gas budget if provided
        if (transaction.gasBudget) {
          tx.setGasBudget(BigInt(transaction.gasBudget));
        }

        // Create transfer transaction
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(transaction.amount)]);

        tx.transferObjects([coin], tx.pure.address(transaction.to));
      } else {
        throw new Error('Invalid transaction: must provide either transaction or to/amount');
      }

      const _tx = await tx.toJSON();

      // Sign the transaction using the provider (correct method name)
      const signedTransaction = await this.suiProvider.signTransaction({
        transaction: _tx as any,
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

      let tx: Transaction;

      // Handle different transaction types
      if (transaction.transaction) {
        tx = transaction.transaction;
      } else if (transaction.to && transaction.amount) {
        // Create simple transfer transaction
        tx = new Transaction();

        // Set gas budget if provided
        if (transaction.gasBudget) {
          tx.setGasBudget(BigInt(transaction.gasBudget));
        }

        // Create transfer transaction
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(transaction.amount)]);

        tx.transferObjects([coin], tx.pure.address(transaction.to));
      } else {
        throw new Error('Invalid transaction: must provide either transaction or to/amount');
      }

      // Execute the transaction using the provider (correct method name)
      const result = await this.suiProvider.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        account: this._address,
        chain: this.chain.chainIdentifier,
        requestType: transaction.requestType || 'WaitForEffectsCert',
      });

      return result.digest;
    } catch (error) {
      console.error('Error sending Sui transaction:', error);
      throw error;
    }
  }

  // Send a pre-signed transaction
  async sendRawTransaction(_signedTransactionBytes: string): Promise<string> {
    throw new Error('Not implemented');
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
      let tx: Transaction;

      if (transaction.transaction) {
        tx = transaction.transaction;
      } else if (transaction.to && transaction.amount) {
        tx = this.createTransferTransaction(transaction.to, transaction.amount);
      } else {
        throw new Error('Invalid transaction for gas estimation');
      }

      // Dry run to estimate gas
      const dryRunResult = await this.chain.provider.dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: this.chain.provider }),
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
