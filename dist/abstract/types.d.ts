import { Subscription } from 'rxjs';
import { OrdersExecutor } from './orders-executor';
import { ExchangeAccount } from './exchange-account';
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
export declare type StopType = 'normal' | 'profit' | 'loss';
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
    lat: number;
    lng: number;
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
export interface Bot {
    idreg: number;
    url: string;
    port: number;
    ip: string;
    accounts?: {
        idUser: number;
        userOperations: Partial<UserOperation>[];
        error?: {
            [type: string]: {
                code?: number;
                message: string;
            };
        };
    }[];
    exchanges?: BotExchange[];
}
export interface BotExchange {
    exchanges: ExchangeType;
    maxAccounts: number;
}
export interface Operation {
    idreg: 'new' | number;
    idStrategy: number;
    idCreador: number;
    params: {
        [key: string]: any;
    };
    exchange: ExchangeType;
    market: MarketType;
    quoteAsset: CoinType;
    baseAsset: CoinType;
    accounts?: UserOperation[];
    users?: User[];
    strategy?: Strategy;
}
export interface UserOperation {
    idreg: 'new' | number;
    idUser: number;
    idOperation: 'new' | number;
    idBot: number;
    results: UserOperationResult;
    autoStart: boolean;
    started?: string;
    finished?: string;
    user?: User;
    bot?: Bot;
    operation?: Operation;
    info?: AccountInfo;
    error?: {
        [type: string]: {
            code?: number;
            message: string;
        };
    };
    ui?: {
        quoteBalance?: number;
        quoteInvestment?: number;
        baseInvestment?: number;
        icon?: string;
        iconColor?: string;
    };
}
export declare type UserOperationStatus = 'initial' | 'market' | 'activated' | 'closed';
export interface UserOperationResult {
    status: UserOperationStatus;
    entryPrice?: number;
    pnl?: number;
}
export declare const userOperationStringify: (row: UserOperation) => UserOperation;
export declare const userOperationParse: (row: UserOperation) => UserOperation;
//# sourceMappingURL=types.d.ts.map