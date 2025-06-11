import { SuiContract } from '@/phoenix-wallet';
import { ITokenContract, ResponseTransacton } from './TokenContract';

class TokenSdk {
  private readonly _connection: any;
  constructor(
    _connection: any,
    private readonly tokenAddress: string
  ) {
    this._connection = _connection;
  }
}

export class SuiTokenContract extends SuiContract<TokenSdk> implements ITokenContract {
  constructor(connection: any, tokenAddress: string) {
    const sdk = new TokenSdk(connection, tokenAddress);
    super(connection, tokenAddress, sdk);
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
    if (!this.wallet) {
      throw new Error('Wallet not found');
    }
    const fromPublicKey = new PublicKey(this.wallet.address);
    const toPublicKey = new PublicKey(to);
    const transaction = await this.sdk.transfer(fromPublicKey, toPublicKey, amount);
    const txHash = await this.signAndSendTransaction(transaction.transaction);
    return {
      txHash,
      wait: () => {
        return this.waitTransaction(txHash, transaction.blockhash, transaction.lastValidBlockHeight);
      },
    };
  }

  async signAndSendTransaction(transaction: VersionedTransaction): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not found');
    }
    const signedTransaction = await this.wallet.signTransaction(transaction);
    const txHash = await this.wallet.sendRawTransaction(signedTransaction);
    return txHash;
  }
}
