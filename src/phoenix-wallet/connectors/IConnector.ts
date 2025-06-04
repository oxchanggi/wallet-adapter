import { ChainType } from "../chains/Chain";
import { CallbackManager } from "./CallbackManager";
import { DappMetadata } from "./types";

export interface IConnector {
    id: string;
    name: string;
    logo: string;
    dappMetadata: DappMetadata;
    connect(): Promise<{ address: string, chainId: string }>;
    disconnect(): Promise<void>;
    getConnectedAddresses(): Promise<string[]>;
    getChainId(): Promise<string>;
    init(): Promise<void>;
    handleEventConnect(address: string, chainId: string): Promise<void>;
    handleEventDisconnect(address: string): Promise<void>;
    handleEventChainChanged(chainId: string): Promise<void>;
    handleEventAccountChanged(address: string[]): Promise<void>;
    registerConnectorCallback(callback: IConnectorCallback): void;
    unregisterConnectorCallback(callback: IConnectorCallback): void;
    isInstalled(): Promise<boolean>;
    get chainType(): ChainType;
}

export abstract class Connector implements IConnector {
    id: string;
    name: string;
    logo: string;
    dappMetadata: DappMetadata;
    protected callbackManager: CallbackManager;
    constructor(id: string, name: string, logo: string, dappMetadata: DappMetadata) {
        this.id = id;
        this.name = name;
        this.logo = logo;
        this.dappMetadata = dappMetadata;
        this.callbackManager = new CallbackManager(id);
    }
    abstract connect(): Promise<{ address: string, chainId: string }>;
    abstract disconnect(): Promise<void>;
    abstract getConnectedAddresses(): Promise<string[]>;
    abstract getChainId(): Promise<string>;
    abstract init(): Promise<void>;
    abstract get chainType(): ChainType;
    abstract setupEventListeners(): Promise<void>;
    abstract isInstalled(): Promise<boolean>;

    async handleEventConnect(address: string, chainId?: string): Promise<void> {
        this.callbackManager.notifyConnect(address, chainId);
    }

    async handleEventDisconnect(address: string): Promise<void> {
        this.callbackManager.notifyDisconnect(address);
    }

    async handleEventChainChanged(chainId: string): Promise<void> {
        const formattedChainId = chainId.startsWith('0x') 
        ? parseInt(chainId, 16).toString()
        : chainId;
        this.callbackManager.notifyChainChanged(formattedChainId);
    }

    async handleEventAccountChanged(addresses: string[]): Promise<void> {
        this.callbackManager.notifyAccountChanged(addresses);
    }

    registerConnectorCallback(callback: IConnectorCallback): void {
        this.callbackManager.registerConnectorCallback(callback);
    }
    unregisterConnectorCallback(callback: IConnectorCallback): void {
        this.callbackManager.unregisterConnectorCallback(callback);
    }
}

export interface IConnectorCallback {
    onConnect(connectorId: string, address: string, chainId?: string): Promise<void>;
    onDisconnect(connectorId: string, address: string): Promise<void>;
    onChainChanged(connectorId: string, chainId: string): Promise<void>;
    onAccountChanged(connectorId: string, address: string[]): Promise<void>;
}
