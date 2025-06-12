import { SuiContract } from '@/phoenix-wallet/contracts/SuiContract';
import { ITokenContract, ResponseTransacton } from './TokenContract';

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction, type TransactionObjectArgument } from '@mysten/sui/transactions';
import { normalizeStructTag, toBase64 } from '@mysten/sui/utils';
import { VersionedTransaction } from '@solana/web3.js';

export const checkAndSplitCoin = async (
  client: SuiClient,
  txb: Transaction,
  sender: string,
  coinType: string,
  amount: number | bigint
) => {
  let coinObjectToSplit: TransactionObjectArgument | string = txb.gas;

  if (
    coinType !== '0x2::sui::SUI' &&
    coinType !== '0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'
  ) {
    const userCoins = await client.getCoins({ owner: sender, coinType });
    console.log('userCoins: ', userCoins);
    if (userCoins.data.length === 0) {
      throw new Error(`No coins found for ${coinType}`);
    }
    const [primaryCoinX, ...restCoinXs] = userCoins.data;
    if (restCoinXs.length > 0 && BigInt(primaryCoinX.balance) < BigInt(amount)) {
      txb.mergeCoins(
        txb.object(primaryCoinX.coinObjectId),
        restCoinXs.map((coin) => txb.object(coin.coinObjectId))
      );
    }

    coinObjectToSplit = primaryCoinX.coinObjectId;
  }

  const [coin] = txb.splitCoins(coinObjectToSplit, [amount]);

  return coin;
};

class TokenSdk {
  private readonly suiClient: SuiClient;
  private readonly tokenAddress: string;
  private metadata: {
    name: string;
    symbol: string;
    decimals: number;
  } | null;
  constructor(tokenAddress: string) {
    this.tokenAddress = normalizeStructTag(tokenAddress);
    this.suiClient = new SuiClient({
      url: getFullnodeUrl('testnet'),
    });
    this.metadata = null;
  }

  private async getMetadata(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
  }> {
    const result = await this.suiClient.getCoinMetadata({
      coinType: this.tokenAddress,
    });
    if (!result) {
      throw new Error('Metadata not found for ' + this.tokenAddress);
    }
    this.metadata = {
      name: result?.name,
      symbol: result?.symbol,
      decimals: result?.decimals,
    };

    return {
      name: result?.name,
      symbol: result?.symbol,
      decimals: result?.decimals,
    };
  }

  async getDecimals(): Promise<number> {
    if (!this.metadata) {
      this.metadata = await this.getMetadata();
    }
    return this.metadata.decimals;
  }

  async getName(): Promise<string> {
    if (!this.metadata) {
      this.metadata = await this.getMetadata();
    }
    return this.metadata.name;
  }

  async getSymbol(): Promise<string> {
    if (!this.metadata) {
      this.metadata = await this.getMetadata();
    }
    return this.metadata.symbol;
  }

  async getTotalSupply(): Promise<{ amount: string; uiAmount: string }> {
    const result = await this.suiClient.getTotalSupply({
      coinType: this.tokenAddress,
    });
    return {
      amount: result.value,
      uiAmount: (parseInt(result.value) / Math.pow(10, await this.getDecimals())).toString(),
    };
  }

  async getBalance(owner: string): Promise<{ amount: string; uiAmount: string }> {
    const result = await this.suiClient.getBalance({
      owner,
      coinType: this.tokenAddress,
    });

    return {
      amount: result.totalBalance,
      uiAmount: (parseInt(result.totalBalance) / Math.pow(10, await this.getDecimals())).toString(),
    };
  }

  async buildTransferTx(sender: string, to: string, amount: string, gasBudget: number = 5_000_000) {
    const txb = new Transaction();
    txb.setSender(sender);
    txb.setGasBudget(gasBudget);

    const coin = await checkAndSplitCoin(this.suiClient, txb, sender, this.tokenAddress, BigInt(amount));

    txb.transferObjects([coin], to);

    const txBytes = await txb.build({ client: this.suiClient });

    return { transaction: toBase64(txBytes) };
  }
}

export class SuiTokenContract extends SuiContract<TokenSdk> implements ITokenContract {
  constructor(suiClient: SuiClient, tokenAddress: string) {
    const sdk = new TokenSdk(tokenAddress);
    super(suiClient, tokenAddress, sdk);
  }

  getAllowance(address: string, spender: string): Promise<string> {
    throw new Error('Method not supported.');
  }

  async getDecimals(): Promise<number> {
    return this.sdk.getDecimals();
  }

  async getSymbol(): Promise<string> {
    return this.sdk.getSymbol();
  }

  async getTotalSupply(): Promise<string> {
    return this.sdk.getTotalSupply();
  }

  async getBalance(address: string): Promise<{ amount: string; uiAmount: string }> {
    const amount = await this.sdk.getBalance(address);
    const decimals = await this.getDecimals();
    const uiAmount = (parseInt(amount) / Math.pow(10, decimals)).toString();
    return { amount, uiAmount };
  }

  async transfer(to: string, amount: string): Promise<ResponseTransacton> {
    try {
      // const transaction = await this.sdk.buildTransferTx(this.wallet.address, to, amount);
    } catch (error) {
      throw error;
    }
  }

  async signAndSendTransaction(transaction: VersionedTransaction): Promise<string> {
    try {
      // const result = await this.suiClient.signAndExecuteTransactionBlock({
      //   transactionBlock: transaction,
      //   account: this.wallet.address,
      // });
    } catch (error) {
      throw error;
    }
  }
}
