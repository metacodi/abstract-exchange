import { AbstractController } from "./abstract-controller";
import { AbstractExchange } from "./abstract-exchange";
import { AccountInfo, AccountMarket, CoinType, FundingWallet, Strategy } from "./types";
export declare abstract class AbstractAccount {
    info: AccountInfo;
    config: {
        [key: string]: any;
    };
    exchangeProvider: (account: AbstractAccount, strategy: Strategy) => AbstractExchange;
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
    constructor(info: AccountInfo, config: {
        [key: string]: any;
    }, exchangeProvider: (account: AbstractAccount, strategy: Strategy) => AbstractExchange);
    get idreg(): number;
    get folder(): string;
    initialize(): Promise<void>;
    abstract loadStrategies(): Promise<Strategy[]>;
    protected abstract createController(account: AbstractAccount, strategy: Strategy, executor: AbstractExchange): AbstractController;
    startStrategy(strategy: Strategy): {
        controller: AbstractController;
        exchange: AbstractExchange;
    };
    stopStrategy(controller: AbstractController): void;
    get allQuoteAssets(): CoinType[];
    profitAndLoss(quoteAsset: CoinType, price: number): number;
}
//# sourceMappingURL=abstract-account.d.ts.map