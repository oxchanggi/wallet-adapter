import { EvmConnector } from "./EvmConnector";
import { DappMetadata } from "../types";

export class RainbowEvmConnector extends EvmConnector {
    constructor(dappMetadata: DappMetadata) {
        super("rainbowevm", {
            name: "Rainbow",
            logo:"https://rainbowkit.com/rainbow.svg"
        }, dappMetadata);
    }

    get provider(): any {
        if (typeof window !== 'undefined' && window.rainbow) {
            return window.rainbow;
        } else if (typeof window !== 'undefined' && window.ethereum?.isRainbow) {
            // Fallback to window.ethereum if it has isPhantom property
            return window.ethereum;
        }
    }

    async isInstalled(): Promise<boolean> {
        // Check if Rainbow's Ethereum provider exists
        if (typeof window !== 'undefined') {
            return Boolean(window.rainbow || (window.ethereum?.isRainbow));
        }
        return false;
    }
} 

declare global {
    interface Window {
        rainbow?: any;
    }
} 