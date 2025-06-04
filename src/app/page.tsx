'use client';
import { WalletProvider } from "../phoenix-wallet";
import { SimpleWalletConnect } from "./SimpleWalletConnect";
import { MetamaskEvmConnector, PhantomEvmConnector } from "../phoenix-wallet";

const dappMetadata = {
  name: "Phoenix Wallet",
  url: "https://phoenix-wallet.com",
};

export const defaultConnectors = [
  new MetamaskEvmConnector(dappMetadata),
  new PhantomEvmConnector(dappMetadata),
]

export default function Home() {
  return (
    <WalletProvider connectors={defaultConnectors}>
      <SimpleWalletConnect />
    </WalletProvider>
  );
}
