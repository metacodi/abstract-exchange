import { BehaviorSubject, Subject } from "rxjs";
import { Limit, TaskExecutor } from "./task-executor";
import { ExchangeAccount } from "./exchange-account";
import { AccountEvent, Balance, SymbolType, ExchangeType, KlineIntervalType, MarketKline, MarketPrice, MarketSymbol, MarketType } from "./types";
import { Order, OrderTask, PartialOrder, ResultOrderStatus } from "./types";
import { ExchangeWebsocket } from "./exchange-websocket";
import { ExchangeApi } from "./exchange-api";
import { WsAccountUpdate } from "./exchange-websocket-types";
export declare abstract class AbstractExchange extends TaskExecutor {
    market: MarketType;
    name: ExchangeType;
    abstract get marketApi(): ExchangeApi;
    abstract get marketWs(): ExchangeWebsocket;
    accountWs: {
        [accounId: string]: ExchangeWebsocket;
    };
    symbols: MarketSymbol[];
    limitRequest: Limit;
    limitOrders: Limit;
    balanceLocketIsMissing: boolean;
    isReady: boolean;
    exchangeInfoUpdated: Subject<void>;
    ordersLimitsChanged: BehaviorSubject<Limit>;
    marketKlineSubjects: {
        [symbolKey_Interval: string]: Subject<MarketKline>;
    };
    marketPriceSubjects: {
        [symbolKey: string]: Subject<MarketPrice>;
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
    abstract initialize(): Promise<void>;
    retrieveExchangeInfo(): Promise<void>;
    protected processExchangeLimits(rateLimits: Limit[]): void;
    getMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice>;
    protected createMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice>;
    getMarketPrice(symbol: SymbolType): Promise<MarketPrice>;
    getMarketKlineSubject(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;
    protected createMarketKlineSubject(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;
    getMarketSymbol(symbol: SymbolType): Promise<MarketSymbol>;
    protected abstract createAccountWebsocket(account: ExchangeAccount): ExchangeWebsocket;
    protected getAccountWebsocket(account: ExchangeAccount): ExchangeWebsocket;
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
    findMarketSymbol(symbol: SymbolType): any;
    fixBase(base: number, symbol: SymbolType): number;
    fixQuote(quote: number, symbol: SymbolType): number;
}
//# sourceMappingURL=abstract-exchange.d.ts.map