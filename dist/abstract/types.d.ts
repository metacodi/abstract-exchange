import { Subscription } from 'rxjs';
import { OrdersExecutor } from './orders-executor';
import { ExchangeAccount } from './exchange-account';
export declare type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export declare type ExchangeType = 'simulator' | 'binance' | 'kucoin' | 'okx' | 'bitget' | 'gate-io' | 'xt-com';
export declare type MarketType = 'spot' | 'futures' | 'margin';
export declare type OrderSide = 'buy' | 'sell';
export declare type TradeDirection = 'long' | 'short';
export declare type TradeSide = 'open' | 'close';
export declare type PreviousOrderStatus = 'post' | 'cancel';
export declare type ResultOrderStatus = 'new' | 'filled' | 'canceled' | 'partial' | 'unsatisfied' | 'expired' | 'rejected';
export declare type OrderStatus = PreviousOrderStatus | ResultOrderStatus;
export declare type KlineIntervalType = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';
export declare type MarginMode = 'cross' | 'isolated';
export declare type PositionSide = 'both' | 'long' | 'short';
export declare type AvailableOrderTypes = 'market' | 'limit' | 'stop' | 'stop_loss_limit' | 'limit_market' | 'stop_market' | 'oco';
export declare type OrderType = Extract<'market' | 'limit' | 'stop' | 'stop_loss_limit' | 'limit_market' | 'stop_market' | 'oco', AvailableOrderTypes>;
export declare type TaskType = 'getOrder' | 'postOrder' | 'cancelOrder';
export declare type CoinType = 'BNB' | 'BTC' | 'ETC' | 'USDT' | 'USDC' | 'USD' | 'EUR';
export interface SymbolType {
    baseAsset: CoinType;
    quoteAsset: CoinType;
}
export interface Task {
    type: TaskType;
    data: {
        [key: string]: any;
    };
}
export interface OrderTask extends Task {
    type: TaskType;
    data: {
        account: ExchangeAccount;
        controllerId: string;
        order: Order;
    };
}
export interface MarketSymbol {
    symbol: SymbolType;
    ready: boolean;
    quotePrecision?: number;
    basePrecision?: number;
    quantityPrecision?: number;
    pricePrecision?: number;
    sizeMultiplier?: number;
    minTradeAmount?: number;
    maxTradeAmount?: number;
    makerCommission?: number;
    takerCommission?: number;
    longLeverage?: number;
    shortLeverage?: number;
    minLeverage?: number;
    maxLeverage?: number;
}
export interface MarketPrice {
    symbol?: SymbolType;
    price: number;
    timestamp?: string;
    baseVolume?: number;
    quoteVolume?: number;
}
export interface OrderBookPrice {
    symbol?: SymbolType;
    bidPrice: number;
    bidQty: number;
    askPrice: number;
    askQty: number;
    timestamp?: string;
}
export declare type SimulatorMode = 'interval' | 'tickPrice';
export interface MarketKline {
    symbol?: SymbolType;
    interval?: KlineIntervalType;
    open: number;
    close: number;
    high: number;
    low: number;
    openTime: string;
    closeTime?: string;
    quoteVolume: number;
    baseVolume?: number;
}
export interface SimulationData {
    t: "F" | "P" | "B" | "O" | "R";
    i: number;
    d: {
        [key: string]: any;
    };
}
export interface Strategy {
    idreg: number;
    controller: string;
    description: string;
    exchange: ExchangeType;
    simulatorDataSource?: {
        source: string | (number | 'up' | 'down')[];
        sourceType: 'price' | 'kline';
        format: 'generic' | 'binance';
        mode: SimulatorMode;
        period?: number;
        baseQuantity?: number;
        quoteQuantity: number;
        commissionAsset?: CoinType;
    };
    market: MarketType;
    symbol: SymbolType;
    autoStart: boolean;
    params: BaseStrategyParams;
    differential?: number;
}
export interface UserAccount {
    idreg: number;
    nombre: string;
    apellidos: string;
    telefono: string;
    email: string;
    password: string;
    folder: string;
    token?: string;
}
export interface AccountInfo {
    canTrade: boolean;
    canWithdraw: boolean;
    canDeposit: boolean;
    balances: Balance[];
    positions?: Position[];
}
export interface Balance {
    asset: CoinType;
    balance?: number;
    available?: number;
    locked?: number;
    remainder?: number;
    fee?: number;
}
export interface Position {
    symbol: SymbolType;
    marginAsset?: CoinType;
    positionAmount: number;
    entryPrice: number;
    unrealisedPnl: number;
    marginType: MarginMode;
    positionSide: PositionSide;
}
export interface AccountMarket {
    balances: {
        [CoinType: string]: Balance;
    };
    positions?: {
        [CoinType: string]: Position;
    };
    orders: Order[];
    executor: OrdersExecutor;
    averagePrices: {
        [symbolKey: string]: number;
    };
}
export declare type AccountEventType = 'accountReady' | 'accountUpdate';
export declare type AccountEvent = AccountReadyStatus | AccountUpdate;
export interface AccountReadyStatus {
    type: 'accountReady';
    ready: boolean;
}
export interface AccountUpdate {
    type: 'accountUpdate';
    market: MarketType;
    balances: Balance[];
}
export declare type BalanceUpdateType = 'deposit' | 'withdraw' | 'order';
export interface BalanceUpdateResult {
    update: BalanceUpdateType;
    market: MarketType;
    timestamp?: string;
    balance: Balance[];
}
export interface FundingWallet {
    asset: string;
    free: number;
    locked: number;
    freeze: number;
    withdrawing: number;
    btcValuation: number;
}
export interface OrderId {
    accountId: number;
    strategyId: number;
    instanceId: number;
    orderId: number;
    ocoId?: string;
}
export interface Order {
    id: string;
    exchangeId: number;
    side: OrderSide;
    type: OrderType;
    status: OrderStatus;
    symbol?: SymbolType;
    baseQuantity?: number;
    quoteQuantity?: number;
    price?: number;
    stopPrice?: number;
    rejectReason?: string;
    isOco?: boolean;
    created?: string;
    posted?: string;
    executed?: string;
    syncronized?: boolean;
    idOrderBuyed?: string;
    profit?: number;
    commission?: number;
    commissionAsset?: CoinType;
}
export interface PartialOrder {
    subscription?: Subscription;
    order: Order;
    accumulated: number;
    count: number;
}
export interface BaseStrategyParams {
    isPercentInvestment?: boolean;
    investment?: number;
    market?: MarketType;
    leverage?: number;
}
export interface InstanceController {
    id: number;
    created: string;
    updated: string;
    lastOrderId: number;
    orders: Order[];
    balances: {
        [key: string]: Balance;
    };
}
//# sourceMappingURL=types.d.ts.map