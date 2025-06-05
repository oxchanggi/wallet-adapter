import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolanaConnector } from "./SolanaConnector";
import { DappMetadata } from "../types";
import { IChain } from "../../chains/Chain";
import { SolanaWalletClient } from "./SolanaWalletClient";

export class PhantomSolConnector extends SolanaConnector {

  constructor(dappMetadata: DappMetadata) {
    super("phantomsol", {
      name: "Phantom",
      logo: "Not implemented",
    }, dappMetadata);
  }

  get adapter() {
    return new PhantomWalletAdapter();
  }
  
}