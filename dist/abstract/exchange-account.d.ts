import { AbstractController } from "./abstract-controller";
import { Exchange } from "./exchange";
import { UserAccount, AccountMarket, CoinType, FundingWallet, Strategy } from "./types";
export declare abstract class ExchangeAccount {
    info: UserAccount;
    config: {
        [key: string]: any;
    };
    exchangeProvider: (account: ExchangeAccount, strategy: Strategy) => Exchange;
    exchanges: {
        [ExchangeType: string]: {
            apiKey: string;
            apiSecret: string;
            apiPassphrase?: string;
        };
    };
    strategies?: Strategy[];
    controllers: AbstractController[];
    markets?: {
        [MarketType: string]: AccountMarket;
    };
    fondosWallet?: {
        [CoinType: string]: FundingWallet;
    };
    constructor(info: UserAccount, config: {
        [key: string]: any;
    }, exchangeProvider: (account: ExchangeAccount, strategy: Strategy) => Exchange);
    get idreg(): number;
    get folder(): string;
    initialize(): Promise<void>;
    abstract loadStrategies(): Promise<Strategy[]>;
    protected abstract createController(account: ExchangeAccount, strategy: Strategy, executor: Exchange): AbstractController;
    startStrategy(strategy: Strategy): {
        controller: AbstractController;
        exchange: Exchange;
    };
    stopStrategy(controller: AbstractController): void;
    get allQuoteAssets(): CoinType[];
    profitAndLoss(quoteAsset: CoinType, price: number): number;
}
//# sourceMappingURL=exchange-account.d.ts.map