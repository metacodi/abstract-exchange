import { BehaviorSubject, Subject } from "rxjs";
import { Limit, TaskExecutor } from "./task-executor";
import { AbstractAccount } from "./abstract-account";
import { AccountEvent, ExchangeType, KlineIntervalType, MarketKline, MarketPrice, MarketSymbol, MarketType, Order, OrderBookPrice, OrderEvent, OrderTask, PartialOrder, ResultOrderStatus, SymbolType } from "./types";
export declare abstract class AbstractExchange extends TaskExecutor {
    market: MarketType;
    limitRequest: Limit;
    limitOrders: Limit;
    symbols: MarketSymbol[];
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
        [controllerId: string]: Subject<OrderEvent>;
    };
    partialPeriod: number;
    partials: {
        [orderId: string]: PartialOrder;
    };
    abstract exchange: ExchangeType;
    constructor(market: MarketType);
    protected abstract retrieveExchangeInfo(): void;
    protected abstract retrieveAcountInfo(account: AbstractAccount): Promise<boolean>;
    getMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice>;
    protected abstract createMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice>;
    abstract getMarketPrice(symbol: SymbolType): Promise<MarketPrice>;
    abstract getOrderBookTicker(symbol: SymbolType): Promise<OrderBookPrice>;
    getMarketKlineSubject(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;
    protected abstract createMarketKlineSubject(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;
    getAccountEventsSubject(account: AbstractAccount, symbol?: SymbolType): Subject<AccountEvent>;
    protected abstract createAccountEventsSubject(account: AbstractAccount, symbol?: SymbolType): Subject<AccountEvent>;
    do(task: OrderTask): void;
    getOrder(task: OrderTask): void;
    postOrder(task: OrderTask): void;
    cancelOrder(task: OrderTask): void;
    protected abstract getOrderTask(task: OrderTask): void;
    protected abstract postOrderTask(task: OrderTask): void;
    protected abstract cancelOrderTask(task: OrderTask): void;
    protected executeTask(task: OrderTask): Promise<any>;
    protected processGetOrderTask(account: AbstractAccount, order: Order): void;
    getOrdersEventsSubject(account: AbstractAccount, controllerId: string): Subject<OrderEvent>;
    protected processOrderUpdate(account: AbstractAccount, event: OrderEvent): void;
    protected processPartialFilled(account: AbstractAccount, order: Order): void;
    protected completePartialFilled(account: AbstractAccount, order: Order): void;
    protected notifyUnsatisfiedPartialOrder(account: AbstractAccount, partial: PartialOrder): void;
    protected isExecutedStatus(status: ResultOrderStatus): boolean;
}
//# sourceMappingURL=abstract-exchange.d.ts.map