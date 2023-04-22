import { Limit } from "./task-executor";
import { CoinType, KlineIntervalType, MarginMode, MarketType, OrderSide, OrderType, StopType, SymbolType, TradeSide } from "./types";
export interface ApiCredentials {
    apiKey: string;
    apiSecret: string;
    apiPassphrase?: string;
}
export interface ApiOptions extends ApiCredentials {
    market: MarketType;
    isTest?: boolean;
}
export interface ApiRequestOptions {
    params?: any;
    headers?: {
        [key: string]: string | number;
    };
    isPublic?: boolean;
    error?: {
        code?: number;
        message?: string;
    };
}
export interface ExchangeInfo {
    limits: Limit[];
}
export interface KlinesRequest {
    symbol: SymbolType;
    interval: KlineIntervalType;
    start?: string;
    end?: string;
    limit?: number;
}
export interface OrderBookTickerRequest {
    symbol: SymbolType;
    interval: KlineIntervalType;
    startTime?: number;
    endTime?: number;
    limit?: number;
}
export interface LeverageInfo {
    symbol: SymbolType;
    longLeverage?: number;
    shortLeverage?: number;
    leverage?: number;
}
export interface SetLeverage {
    symbol: SymbolType;
    coin: CoinType;
    longLeverage: number;
    shortLeverage: number;
    mode: MarginMode;
}
export interface GetHistoryOrdersRequest {
    symbol: SymbolType;
    startTime?: number;
    endTime?: number;
    afterExchangeId?: string;
    beforeExchangeId?: string;
    id?: string;
    limit?: number;
    pageSize?: number;
}
export interface GetOpenOrdersRequest {
    symbol: SymbolType;
}
export interface GetOrderRequest {
    symbol: SymbolType;
    id?: string;
    exchangeId?: string;
    type?: OrderType;
}
export interface PostOrderRequest {
    id: string;
    side: OrderSide;
    type: OrderType;
    stop?: StopType;
    trade?: TradeSide;
    symbol: SymbolType;
    baseQuantity?: number;
    quoteQuantity?: number;
    price?: number;
    stopPrice?: number;
    mode?: MarginMode;
    closePosition?: boolean;
}
export interface CancelOrderRequest {
    symbol: SymbolType;
    id: string;
    exchangeId: string;
    type: OrderType;
}
//# sourceMappingURL=exchange-api-types.d.ts.map