import { IWallet } from "../wallets/IWallet";

export interface IContract {
    wallet: IWallet<any, any, any, any> | undefined;
    initialize(): Promise<void>;
    get address(): string;
}

export abstract class Contract implements IContract {
    protected _address: string;
    wallet: IWallet<any, any, any, any> | undefined;
    constructor(address: string) {
        this._address = address;
    }
    abstract initialize(): Promise<void>;

    get address(): string {
        return this._address;
    }
}
