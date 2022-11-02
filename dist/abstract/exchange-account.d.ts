import { AbstractController } from "./abstract-controller";
import { Exchange } from "./abstarct-exchange";
import { UserAccount, AccountMarket, FundingWallet, Strategy } from "./types";
export interface ExchangeAccount {
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
    user: UserAccount;
    get idUser(): number;
    config: {
        [key: string]: any;
    };
    exchangeProvider: (account: ExchangeAccount, strategy: Strategy) => Exchange;
    initialize(): Promise<void>;
    loadStrategies(): Promise<Strategy[]>;
    startStrategy(strategy: Strategy): Promise<{
        controller: AbstractController;
        exchange: Exchange;
    }>;
    createController(executor: Exchange, account: ExchangeAccount, strategy: Strategy): AbstractController;
    stopStrategy(controller: AbstractController): Promise<void>;
}
//# sourceMappingURL=exchange-account.d.ts.map