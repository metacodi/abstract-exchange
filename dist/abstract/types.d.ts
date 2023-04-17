import { Subscription } from 'rxjs';
import { OrdersExecutor } from './orders-executor';
import { ExchangeAccount } from './exchange-account';
import { GetOpenOrdersRequest, CancelOrderRequest, GetHistoryOrdersRequest, GetOrderRequest, PostOrderRequest } from './exchange-api-types';
export declare type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export declare type ExchangeType = 'simulator' | 'binance' | 'kucoin' | 'okx' | 'bitget' | 'gate-io' | 'xt-com';
export declare type MarketType = 'spot' | 'futures' | 'margin';
export declare type OrderSide = 'buy' | 'sell';
export declare type TradeSide = 'long' | 'short';
export declare type PreviousOrderStatus = 'post' | 'cancel';
export declare type ResultOrderStatus = 'new' | 'filled' | 'canceled' | 'partial' | 'unsatisfied' | 'expired' | 'rejected';
export declare type OrderStatus = PreviousOrderStatus | ResultOrderStatus;
export declare type KlineIntervalType = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';
export declare type MarginMode = 'cross' | 'isolated';
export declare type PositionSide = 'both' | 'long' | 'short';
export declare type OrderType = 'market' | 'limit';
export declare type StopType = 'normal' | 'profit' | 'loss' | 'profit-position' | 'loss-position';
export declare type TaskType = 'getHistoryOrders' | 'getOpenOrders' | 'getOrder' | 'postOrder' | 'cancelOrder';
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
    callback?: (success: any, failed?: any) => void;
}
export declare type OrderTask = GetHistoryOrdersTask | GetOpenOrdersTask | GetOrderTask | PostOrderTask | CancelOrderTask;
export interface GetHistoryOrdersTask extends Task {
    type: 'getHistoryOrders';
    data: {
        account: ExchangeAccount;
        controllerId: string;
        isTest: boolean;
        request: GetHistoryOrdersRequest;
    };
}
export interface GetOpenOrdersTask extends Task {
    type: 'getOpenOrders';
    data: {
        account: ExchangeAccount;
        controllerId: string;
        isTest: boolean;
        request: GetOpenOrdersRequest;
    };
}
export interface GetOrderTask extends Task {
    type: 'getOrder';
    data: {
        account: ExchangeAccount;
        controllerId: string;
        isTest: boolean;
        request: GetOrderRequest;
    };
}
export interface PostOrderTask extends Task {
    type: 'postOrder';
    data: {
        account: ExchangeAccount;
        controllerId: string;
        isTest: boolean;
        request: PostOrderRequest;
    };
}
export interface CancelOrderTask extends Task {
    type: 'cancelOrder';
    data: {
        account: ExchangeAccount;
        controllerId: string;
        isTest: boolean;
        request: CancelOrderRequest;
    };
}
export interface MarketSymbol {
    symbol: SymbolType;
    ready: boolean;
    quotePrecision?: number;
    basePrecision?: number;
    quantityPrecision?: number;
    pricePrecision?: number;
    priceEndStep?: number;
    sizeMultiplier?: number;
    tradeAmountAsset?: 'base' | 'quote';
    minTradeAmount?: number;
    maxTradeAmount?: number;
    commissionAsset?: 'base' | 'quote';
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
}
export interface AccountInfo {
    canTrade?: boolean;
    canWithdraw?: boolean;
    canDeposit?: boolean;
    balances?: Balance[];
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
    price: number;
    leverage: number;
    unrealisedPnl: number;
    marginType: MarginMode;
    positionSide: PositionSide;
    liquidationPrice?: number;
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
    exchangeId: string;
    side: OrderSide;
    type: OrderType;
    stop?: StopType;
    trade?: TradeSide;
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
    leverage?: number;
}
export interface PartialOrder {
    subscription?: Subscription;
    order: Order;
    accumulated: number;
    avgPrice: number;
    count: number;
}
export interface BaseStrategyParams {
    market?: MarketType;
    marginAsset: 'quote' | 'base';
    marginAmount: number;
    marginPercent: number;
    useMarginPercent: boolean;
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
export interface User {
    idreg: number;
    idRole: number;
    idAbstractRole: number;
    idLang: number;
    nombre: string;
    apellidos: string;
    telefono: string;
    telefono2: string;
    email: string;
    validated: boolean;
    pin: any;
    role: Role;
    device: Device;
}
export interface Role {
    idreg: number;
    name: string;
}
export interface Device {
    idreg: number;
    idUser: number;
    ip: string;
    deviceToken: string;
    apiToken: string;
    uuid: string;
    description: string;
    info: string;
    lastLogin: string;
    alertStatus: number;
    security: {
        idreg: number;
        idUser: number;
        idDevice: number;
        allowStoreCredentials: boolean;
        allowBiometricValidation: boolean;
        sendEmailOnNewDevice: boolean;
        sendPushOnNewDevice: boolean;
        sendEmailOnChangeIp: boolean;
        sendPushOnChangeIp: boolean;
    };
    notifications: {
        idreg: number;
        idUser: number;
        idDevice: number;
        allowPushNotifications: boolean;
        allowSonidoPush: boolean;
        sonidoPush: string;
    };
}
export interface ErrorObject {
    code?: number;
    message: string;
    data?: any;
}
export interface Bot {
    idreg: number;
    url: string;
    port: number;
    ip: string;
    accounts?: {
        idUser: number;
        tradings: Partial<Trading>[];
        error?: {
            [type: string]: ErrorObject;
        };
    }[];
    exchanges?: {
        exchange: ExchangeType;
        maxAccounts: number;
    }[];
    connected?: boolean;
}
export interface Operation {
    idreg: 'new' | number;
    idStrategy: number;
    idCreador: number;
    params: {
        [key: string]: any;
    };
    isTest: boolean;
    exchange: ExchangeType;
    market: MarketType;
    quoteAsset: CoinType;
    baseAsset: CoinType;
    tradings?: Trading[];
    users?: User[];
    strategy?: Strategy;
}
export interface Trading {
    idreg: 'new' | number;
    idUser: number;
    idOperation: 'new' | number;
    idBot: number;
    autoStart: boolean;
    started: string;
    finished: string;
    instances: InstanceController[];
    results: TradingResult;
    user?: User;
    bot?: Bot;
    operation?: Operation;
    info?: AccountInfo;
    error?: {
        [type: string]: ErrorObject;
    };
    ui?: {
        quoteBalance?: number;
        quoteMargin?: number;
        baseMargin?: number;
        profitAmount?: number;
        profitPercent?: number;
        icon?: string;
        iconColor?: string;
    };
}
export declare type TradingStatus = 'initial' | 'market' | 'activated' | 'closed';
export interface TradingResult {
    status: TradingStatus;
    openPrice?: number;
    openQuantity?: number;
    closePrice?: number;
    pnl?: number;
    openCommission?: number;
    closeCommission?: number;
    profit?: number;
}
export declare const tradingParse: (row: Trading) => Trading;
export declare const tradingStringify: (row: Trading) => Trading;
//# sourceMappingURL=types.d.ts.map