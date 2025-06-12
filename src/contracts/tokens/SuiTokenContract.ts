import { SuiContract } from '@/phoenix-wallet/contracts/SuiContract';
import { ITokenContract, ResponseTransacton } from './TokenContract';

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Transaction, type TransactionObjectArgument } from '@mysten/sui/transactions';
import { normalizeStructTag } from '@mysten/sui/utils';

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

  async getTotalSupply(): Promise<string> {
    const result = await this.suiClient.getTotalSupply({
      coinType: this.tokenAddress,
    });
    return result.value;
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

    // const txBytes = await txb.build({ client: this.suiClient });

    return { transaction: txb };
  }
}

export class SuiTokenContract extends SuiContract<TokenSdk> implements ITokenContract {
  constructor(suiClient: SuiClient, tokenAddress: string) {
    const sdk = new TokenSdk(tokenAddress);
    super(suiClient, tokenAddress, sdk);
  }

  getAllowance(): Promise<string> {
    throw new Error('Method not supported.');
  }

  async getDecimals(): Promise<number> {
    return this.sdk.getDecimals();
  }

  async getSymbol(): Promise<string> {
    return this.sdk.getSymbol();
  }

  async getTotalSupply(): Promise<string> {
    const result = await this.sdk.getTotalSupply();
    return result;
  }

  async getBalance(address: string): Promise<{ amount: string; uiAmount: string }> {
    const amount = await this.sdk.getBalance(address);
    const decimals = await this.getDecimals();
    const uiAmount = (parseInt(amount.amount) / Math.pow(10, decimals)).toString();

    return {
      amount: amount.amount,
      uiAmount,
    };
  }

  async transfer(to: string, amount: string): Promise<ResponseTransacton> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not found');
      }

      const transaction = await this.sdk.buildTransferTx(this.wallet.address, to, amount);

      const signedTransaction = await this.wallet.signTransaction(transaction);

      const txHash = await this.wallet.sendRawTransaction(signedTransaction);

      return {
        txHash: txHash,
        wait: () => {
          return this.waitTransaction(txHash);
        },
      };
    } catch (error) {
      throw error;
    }
  }
}
