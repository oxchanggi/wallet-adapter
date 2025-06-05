import { EvmConnector } from "./EvmConnector";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { EvmWallet, EvmTransaction } from "../../wallets/EvmWallet";
import { EvmChain } from "../../chains/EvmChain";
import { IChain, ChainType } from "../../chains/Chain";
import { DappMetadata } from "../types";

export class PhantomEvmConnector extends EvmConnector {
    private ethereum: any = null;
    private readonly STORAGE_KEY = 'phantom_evm_connection_status';

    constructor(dappMetadata: DappMetadata) {
        super("phantomevm", {
            name: "Phantom",
            logo: "https://docs.phantom.com/~gitbook/image?url=https%3A%2F%2F187760183-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F-MVOiF6Zqit57q_hxJYp%252Ficon%252FU7kNZ4ygz4QW1rUwOuTT%252FWhite%2520Ghost_docs_nu.svg%3Falt%3Dmedia%26token%3D447b91f6-db6d-4791-902d-35d75c19c3d1&width=48&height=48&sign=23b24c2a&sv=2",
        }, dappMetadata);
    }

    async init(): Promise<void> {
        if (this.ethereum) {
            return;
        }

        // Check if Phantom's Ethereum provider is available
        if (typeof window !== 'undefined' && window.phantom?.ethereum) {
            this.ethereum = window.phantom.ethereum;
        } else if (typeof window !== 'undefined' && window.ethereum?.isPhantom) {
            // Fallback to window.ethereum if it has isPhantom property
            this.ethereum = window.ethereum;
        }
        this.provider = this.ethereum;

        this.setupEventListeners();

        // Check if we have a stored connection
        this.checkStoredConnection();
    }

    private checkStoredConnection(): void {
        if (typeof localStorage !== 'undefined') {
            const storedStatus = localStorage.getItem(this.STORAGE_KEY);
            if (storedStatus === 'connected') {
                // Attempt to reconnect based on stored state
                this.getConnectedAddresses()
                    .then(addresses => {
                        if (addresses.length > 0) {
                            this.activeAddress = addresses[0];
                            this.getChainId().then(chainId => {
                                this.activeChainId = chainId;
                                this.handleEventConnect(this.activeAddress!, this.activeChainId);
                            });
                        } else {
                            // Clear stored connection if no addresses found
                            localStorage.removeItem(this.STORAGE_KEY);
                        }
                    })
                    .catch(() => {
                        localStorage.removeItem(this.STORAGE_KEY);
                    });
            }
        }
    }

    async isInstalled(): Promise<boolean> {
        // Check if Phantom's Ethereum provider exists
        if (typeof window !== 'undefined') {
            return Boolean(window.phantom?.ethereum || (window.ethereum?.isPhantom));
        }
        return false;
    }

    async connect(): Promise<{ address: string, chainId: string }> {
        const result = await super.connect();

        // Store connection status in localStorage
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.STORAGE_KEY, 'connected');
        }

        return result;
    }

    async disconnect(): Promise<void> {
        // Store the current address before clearing it
        const currentAddress = this.activeAddress;

        // Clear the active address and chain ID
        this.activeAddress = undefined;
        this.activeChainId = undefined;

        // Remove the connection status from localStorage
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(this.STORAGE_KEY);
        }

        // Emit the disconnect event if we have a provider and had an active address
        if (this.provider && currentAddress) {
            this.handleEventDisconnect(currentAddress);
        }
    }

    async isConnected(): Promise<boolean> {

        try {
            const storedStatus = localStorage.getItem(this.STORAGE_KEY);
            if (!storedStatus) {
                return false;
            }
            if (this.activeAddress) {
                return true;
            }

            const addresses = await this.getConnectedAddresses().catch(() => []);
            return addresses.length > 0;

        } catch (error) {
            console.error(`Error checking if ${this.id} is connected:`, error);
            return false;
        }
    }
} 