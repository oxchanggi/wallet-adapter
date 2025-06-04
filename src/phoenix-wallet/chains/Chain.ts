export interface IChainConfig {
    id: string;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    chainId: number;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    chainType: ChainType;
}
export interface IChain<T> extends IChainConfig {
    get chainName(): string;
    get chainType(): ChainType;
    get provider(): T;
}

export enum ChainType {
    EVM = "EVM",
    SOLANA = "SOLANA",
}

export abstract class Chain<T> implements IChain<T> {
    id: string;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
    chainId: number;
    nativeCurrency: { name: string; symbol: string; decimals: number; };
    constructor(config: IChain<T>) {
        this.id = config.id;
        this.name = config.name;
        this.rpcUrl = config.rpcUrl;
        this.explorerUrl = config.explorerUrl;
        this.chainId = config.chainId;
        this.nativeCurrency = config.nativeCurrency;
    }
    abstract get chainName(): string;
    abstract get chainType(): ChainType;
    abstract get provider(): T;
}
