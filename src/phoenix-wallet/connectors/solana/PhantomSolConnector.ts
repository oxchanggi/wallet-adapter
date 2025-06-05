import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolanaConnector } from './SolanaConnector';
import { DappMetadata } from '../types';
import { IChain } from '../../chains/Chain';
import { SolanaWalletClient } from './SolanaWalletClient';
import { BaseMessageSignerWalletAdapter } from '@solana/wallet-adapter-base';

export class PhantomSolConnector extends SolanaConnector {
  phantomAdapter: PhantomWalletAdapter | undefined;
  constructor(dappMetadata: DappMetadata) {
    super(
      'phantomsol',
      {
        name: 'Phantom',
        logo: 'Not implemented',
      },
      dappMetadata
    );
  }

  get adapter() {
    return this.phantomAdapter as unknown as BaseMessageSignerWalletAdapter;
  }

  async init() {
    console.log('Initializing Phantom Solana connector');
    this.phantomAdapter = new PhantomWalletAdapter();
    console.log('Phantom adapter initialized', this.phantomAdapter);
    await super.init();
  }
}
