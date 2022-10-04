import { Limit } from "./task-executor";
import { CoinType, KlineIntervalType, MarginMode, MarketSymbol, MarketType, OrderSide, OrderType, PositionSide, SymbolType } from "./types";


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
}

export interface ExchangeInfo {
  symbols: MarketSymbol[];
  limits: Limit[];
}

export interface KlinesRequest {
  symbol: SymbolType;
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


export interface AccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: MarketType;
  balances: AssetInfo[];
  permissions: MarketType[];
}

export interface AssetInfo {
  asset: CoinType;
  free: number;
  locked: number;
}

export interface Position {
  symbol: SymbolType;
  marginAsset?: CoinType; // (margin only)
  positionAmount: number;
  entryPrice: number;
  accumulatedRealisedPreFee: number;
  unrealisedPnl: number;
  marginType: MarginMode;
  isolatedWalletAmount: number;
  positionSide: PositionSide;
}

export interface LeverageInfo {
  symbol: SymbolType;
  leverage: number;
  mode?: MarginMode;
}


export interface GetOrdersRequest {
  symbol: SymbolType;
  orderId?: number;
  startTime?: number;
  endTime?: number;
  /** Results per page. Default 500; max 1000. */
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