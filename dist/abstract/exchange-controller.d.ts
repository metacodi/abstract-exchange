import { AbstractExchange } from "./abstract-exchange";
import { ExchangeAccount } from "./exchange-account";
import { AccountMarket, Balance, CoinType, InstanceController, MarketSymbol, MarketType, Strategy, SymbolType, Trading } from "./types";
export declare type ExchangeControllerStatus = 'on' | 'paused' | 'off';
export interface ExchangeController {
    exchange: AbstractExchange;
    account: ExchangeAccount;
    trading: Trading;
    strategy: Strategy;
    instances: InstanceController[];
    balances: {
        [key: string]: Balance;
    };
    marketSymbol: MarketSymbol;
    status: ExchangeControllerStatus;
    options: {
        [key: string]: any;
    };
    get on(): boolean;
    get off(): boolean;
    get paused(): boolean;
    get readyToStart(): boolean;
    get market(): MarketType;
    get symbol(): SymbolType;
    get quoteAsset(): CoinType;
    get baseAsset(): CoinType;
    get leverage(): number;
    get accountId(): string;
    get strategyId(): string;
    get controllerId(): string;
    get accountMarket(): AccountMarket;
    fixPrice(price: number): number;
    fixQuantity(quantity: number): number;
    fixBase(base: number): number;
    fixQuote(quote: number): number;
    floorQuantity(quantity: number): number;
    get simulated(): boolean;
    start(): Promise<boolean>;
    pause(): void;
    resume(): Promise<boolean>;
    stop(): void;
    abort(): void;
}
//# sourceMappingURL=exchange-controller.d.ts.map