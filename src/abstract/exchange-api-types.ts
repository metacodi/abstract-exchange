import { Limit } from "./task-executor";
import { Balance, CoinType, KlineIntervalType, MarginMode, MarketType, OrderSide, OrderType, PositionSide, StopType, SymbolType, TradeSide } from "./types";


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
  /** Leverage for 'long' trades, when margin mode is 'isolated'. */
  longLeverage?: number;
  /** Leverage for 'short' trades, when margin mode is 'isolated'. */
  shortLeverage?: number;
  /** Leverage for 'long' and 'short' trades, when margin mode is 'cross'. */
  leverage?: number;
}

export interface SetLeverage {
  symbol: SymbolType;
  coin: CoinType;
  longLeverage: number;
  /** Si MarginMode === `cross`, aquesta propietat s'ignora i només es té en compte el valor de `longLeverage`. */
  shortLeverage: number;
  mode: MarginMode;
}

export interface GetHistoryOrdersRequest {
  symbol: SymbolType;
  startTime?: number;
  endTime?: number;
  afterExchangeId?: string;
  beforeExchangeId?: string;
  /** match exactly with the given client id, rather than internal exchange id. */
  id?: string;
  limit?: number;
  pageSize?: number;
}

export interface GetOpenOrdersRequest {
  symbol: SymbolType;
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