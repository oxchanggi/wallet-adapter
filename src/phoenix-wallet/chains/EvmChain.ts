import { JsonRpcProvider } from "ethers";
import { Chain, ChainType, IChain } from "./Chain";

export class EvmChain extends Chain<JsonRpcProvider> {

    private _chainName: string;
    private _provider: JsonRpcProvider;
    
    constructor(chainName: string, config: IChain<JsonRpcProvider>) {
        super(config);
        this._chainName = chainName;
        this._provider = new JsonRpcProvider(config.rpcUrl)
    }

    get chainName(): string {
        return this._chainName;
    }

    get chainType(): ChainType {
        return ChainType.EVM;
    }

    get provider(): JsonRpcProvider {
        return this._provider;
    }
}