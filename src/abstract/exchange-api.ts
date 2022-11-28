import { MarketType, MarketPrice, MarginMode, Balance, MarketKline, Order, SymbolType, MarketSymbol } from './types';

import { AccountInfo, Position } from './types';
import { ExchangeInfo, GetHistoryOrdersRequest, GetOrderRequest, KlinesRequest, LeverageInfo, PostOrderRequest, CancelOrderRequest, ApiOptions, SetLeverage, GetOpenOrdersRequest } from './exchange-api-types';


export interface ExchangeApi {

  market: MarketType;

  options: ApiOptions;
  
 
  // ---------------------------------------------------------------------------------------------------
  //  options
  // ---------------------------------------------------------------------------------------------------

  get apiKey(): string;
  
  get apiSecret(): string;

  get apiPassphrase(): string;

  get isTest(): boolean;

  setCredentials(data: { apiKey: string; apiSecret: string; apiPassphrase?: string; }): void;

  get defaultOptions(): Partial<ApiOptions>;
  

  // ---------------------------------------------------------------------------------------------------
  //  Market
  // ---------------------------------------------------------------------------------------------------

  getExchangeInfo(): Promise<ExchangeInfo>;

  getMarketSymbol(symbol: SymbolType): Promise<MarketSymbol>;
  
  getPriceTicker(symbol: SymbolType): Promise<MarketPrice>;
  
  getKlines(request: KlinesRequest): Promise<MarketKline[]>;
  
  // getOrderBookTicker(request: OrderBookTickerRequest): Promise<OrderBookTicker | OrderBookTicker[]>;
  
  
  // ---------------------------------------------------------------------------------------------------
  //  Account
  // ---------------------------------------------------------------------------------------------------

  getAccountInfo(): Promise<AccountInfo>;

  getLeverage(symbol: SymbolType, mode?: MarginMode): Promise<LeverageInfo>;
  
  setLeverage(request: SetLeverage): Promise<void>;


  //  Account Orders
  // ---------------------------------------------------------------------------------------------------

  getHistoryOrders(request: GetHistoryOrdersRequest): Promise<Partial<Order>[]>;

  getOpenOrders(request: GetOpenOrdersRequest): Promise<Partial<Order>[]>;

  getOrder(request: GetOrderRequest): Promise<Partial<Order>>;

  // getAccountTradeList(request: GetHistoryOrdersRequest): Promise<Order[]>;


  //  Trade Orders
  // ---------------------------------------------------------------------------------------------------

  postOrder(request: PostOrderRequest): Promise<Order>;

  cancelOrder(request: CancelOrderRequest): Promise<Order>;

  // cancelAllSymbolOrders(symbol: SymbolType): Promise<Order>;


  //  helpers
  // ---------------------------------------------------------------------------------------------------

  /** Arrodoneix la quantitat de quote asset per posar les ordres. */
  fixPrice(price: number, marketSymbol: MarketSymbol): number;

  /** Arrodoneix la quantitat de base asset per posar les ordres. */
  fixQuantity(quantity: number, marketSymbol: MarketSymbol): number;
  
  /** Arrodoneix la quantitat de quote asset per gestionar els balanços. */
  fixBase(base: number, marketSymbol: MarketSymbol): number;
  
  /** Arrodoneix la quantitat de base asset per gestionar els balanços. */
  fixQuote(quote: number, marketSymbol: MarketSymbol): number;
  
}
