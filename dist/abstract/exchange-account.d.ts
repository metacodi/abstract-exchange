import { Exchange } from "./abstract-exchange";
import { ExchangeController } from "./exchange-controller";
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
    controllers: ExchangeController[];
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
        controller: ExchangeController;
        exchange: Exchange;
    }>;
    createController(executor: Exchange, account: ExchangeAccount, strategy: Strategy): ExchangeController;
    stopStrategy(controller: ExchangeController): Promise<void>;
}
//# sourceMappingURL=exchange-account.d.ts.map