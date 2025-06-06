'use client';

import { WalletProvider } from '@phoenix-wallet/wallet-adapter';
import { SimpleWalletConnect } from './SimpleWalletConnect';
import { defaultConnectors, chainConfigs } from './wallet-config';

export default function Home() {
  return (
    <WalletProvider connectors={defaultConnectors} chainConfigs={chainConfigs} reconnect="auto">
      <SimpleWalletConnect />
    </WalletProvider>
  );
}
