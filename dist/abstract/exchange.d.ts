import { BehaviorSubject, Subject } from "rxjs";
import { Limit, TaskExecutor } from "./task-executor";
import { ExchangeAccount } from "./exchange-account";
import { AccountEvent, Balance, ExchangeType, KlineIntervalType, MarketKline, MarketPrice, MarketSymbol, MarketType, SymbolType } from "./types";
import { Order, OrderTask, PartialOrder, ResultOrderStatus } from "./types";
import { ExchangeWebsocket } from "./exchange-websocket";
import { ExchangeApi } from "./exchange-api";
import { WsAccountUpdate } from "./exchange-websocket-types";
export declare class Exchange extends TaskExecutor {
    market: MarketType;
    name: ExchangeType;
    api: ExchangeApi;
    marketWs: ExchangeWebsocket;
    accountsWs: {
        [accounId: string]: ExchangeWebsocket;
    };
    symbols: MarketSymbol[];
    limitRequest: Limit;
    limitOrders: Limit;
    symbolsInitialized: BehaviorSubject<("BNB_USDT" | "BTC_USDT" | "ETC_USDT")[]>;
    ordersLimitsChanged: BehaviorSubject<Limit>;
    marketSymbolStatusChanged: BehaviorSubject<MarketSymbol>;
    marketKlineSubjects: {
        [SymbolType: string]: Subject<MarketKline>;
    };
    marketPriceSubjects: {
        [SymbolType: string]: Subject<MarketPrice>;
    };
    accountEventsSubjects: {
        [accountId: string]: Subject<AccountEvent>;
    };
    ordersEventsSubjects: {
        [controllerId: string]: Subject<Order>;
    };
    partialPeriod: number;
    partials: {
        [orderId: string]: PartialOrder;
    };
    constructor(market: MarketType);
    getApiClient(account?: ExchangeAccount): ExchangeApi;
    retrieveExchangeInfo(): Promise<void>;
    protected processExchangeSymbols(exchangeSymbols: MarketSymbol[]): void;
    protected processExchangeLimits(rateLimits: Limit[]): void;
    protected getMarketWebsocket(symbol?: SymbolType): ExchangeWebsocket;
    getMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice>;
    protected createMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice>;
    getMarketPrice(symbol: SymbolType): Promise<MarketPrice>;
    getMarketKlineSubject(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;
    protected createMarketKlineSubject(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;
    protected getAccountWebsocket(account: ExchangeAccount, symbol?: SymbolType): ExchangeWebsocket;
    getAccountEventsSubject(account: ExchangeAccount, symbol?: SymbolType): Subject<AccountEvent>;
    protected createAccountEventsSubject(account: ExchangeAccount, symbol?: SymbolType): Subject<AccountEvent>;
    retrieveAcountInfo(account: ExchangeAccount): Promise<boolean>;
    protected processInitialBalances(account: ExchangeAccount, coins: Balance[]): void;
    protected onAccountUpdate(account: ExchangeAccount, update: WsAccountUpdate): void;
    do(task: OrderTask): void;
    getOrder(task: OrderTask): void;
    postOrder(task: OrderTask): void;
    cancelOrder(task: OrderTask): void;
    protected executeTask(task: OrderTask): Promise<any>;
    protected getOrderTask(task: OrderTask): Promise<void>;
    protected postOrderTask(task: OrderTask): Promise<Order>;
    protected cancelOrderTask(task: OrderTask): Promise<Order>;
    getOrdersEventsSubject(account: ExchangeAccount, controllerId: string): Subject<Order>;
    protected onOrderUpdate(account: ExchangeAccount, eventOrder: Order): void;
    protected processPartialFilled(account: ExchangeAccount, order: Order): void;
    protected completePartialFilled(account: ExchangeAccount, order: Order): void;
    protected notifyUnsatisfiedPartialOrder(account: ExchangeAccount, partial: PartialOrder): void;
    protected isExecutedStatus(status: ResultOrderStatus): boolean;
    fixBase(base: number, symbol: SymbolType): number;
    fixQuote(quote: number, symbol: SymbolType): number;
}
//# sourceMappingURL=exchange.d.ts.map