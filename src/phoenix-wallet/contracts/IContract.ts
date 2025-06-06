import { IWallet } from "../wallets/IWallet";

export interface IContract {
    wallet: IWallet<any, any, any, any> | undefined;
    initialize(): Promise<void>;
    call(method: string, params: any): Promise<any>;
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

    call(method: string, params: any): Promise<any> {
        if (!(method in this)) {
            throw new Error(`Method ${method} not found in SolanaContract`);
        }
        return (this as any)[method](...params);
    }

    get(method: string, params: any): Promise<any> {
        if (!(method in this)) {
            throw new Error(`Method ${method} not found in SolanaContract`);
        }
        return (this as any)[method](...params);
    }
}
