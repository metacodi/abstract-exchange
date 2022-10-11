import { Limit } from "./task-executor";
import { CoinType, KlineIntervalType, MarginMode, MarketType, OrderSide, OrderType, SymbolType, TradeDirection } from "./types";
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
    leverage: number;
    mode?: MarginMode;
}
export interface SetLeverage {
    symbol: SymbolType;
    coin?: CoinType;
    leverage: number;
    direction?: TradeDirection;
    mode?: MarginMode;
}
export interface GetOrdersRequest {
    symbol: SymbolType;
    orderId?: number;
    startTime?: number;
    endTime?: number;
    limit?: number;
}
export interface GetOpenOrdersRequest {
    symbol: SymbolType;
}
export interface GetOrderRequest {
    symbol: SymbolType;
    orderId?: number;
    origClientOrderId?: string;
}
export interface PostOrderRequest {
    symbol: SymbolType;
    side: OrderSide;
    type: OrderType;
    mode?: MarginMode;
    quantity?: number;
    quoteOrderQty?: number;
    price?: number;
    newClientOrderId?: string;
    stopPrice?: number;
    closePosition?: boolean;
}
export interface CancelOrderRequest {
    symbol: SymbolType;
    orderId?: number;
    origClientOrderId?: string;
    newClientOrderId?: string;
}
//# sourceMappingURL=exchange-api-types.d.ts.map