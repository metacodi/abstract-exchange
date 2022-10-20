import { Limit } from "./task-executor";
import { Balance, CoinType, KlineIntervalType, MarginMode, MarketType, OrderSide, OrderType, PositionSide, SymbolType, TradeSide } from "./types";


export interface ApiCredentials {
  apiKey: string;
  apiSecret: string;
  apiPassphrase?: string;
};

export interface ApiOptions extends ApiCredentials {
  /** Indica el tipus de mercat. */
  market: MarketType;
  /** Indica si l'api està en mode test o en real. */
  isTest?: boolean,
}

export interface ApiRequestOptions {
  params?: any;
  headers?: { [key: string]: string | number };
  isPublic?: boolean;
  error?: { code?: number; message?: string; };
}

export interface ExchangeInfo {
  // symbols: MarketSymbol[];
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
  limit?: number;
}

export interface GetOrderRequest {
  symbol: SymbolType;
  id: string;
  exchangeId: string;
  type: OrderType;
}

export interface PostOrderRequest {
  id: string;
  side: OrderSide;
  type: OrderType;
  trade?: TradeSide;
  symbol: SymbolType;
  mode?: MarginMode;
  quantity?: number;
  quoteOrderQty?: number;
  price?: number;
  stopPrice?: number;
  closePosition?: boolean;
}

export interface CancelOrderRequest {
  symbol: SymbolType;
  id: string;
  exchangeId: string;
  type: OrderType;
}