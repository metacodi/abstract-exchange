import { MarketType, MarketPrice, MarginMode, Balance, MarketKline, Order, SymbolType } from './types';
import { AccountInfo, ExchangeInfo, GetOrdersRequest, GetOpenOrdersRequest, GetOrderRequest, KlinesRequest, LeverageInfo, PostOrderRequest, CancelOrderRequest, ApiOptions } from './exchange-api-types';


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

  getAccountInfo(): Promise<AccountInfo>;

  getPriceTicker(symbol: SymbolType): Promise<MarketPrice>;

  getKlines(params: KlinesRequest): Promise<MarketKline[]>;

  // getOrderBookTicker(params: OrderBookTickerRequest): Promise<OrderBookTicker | OrderBookTicker[]>;


  // ---------------------------------------------------------------------------------------------------
  //  Account
  // ---------------------------------------------------------------------------------------------------

  getBalances(): Promise<Balance[]>;

  getLeverage(symbol: SymbolType, mode?: MarginMode): Promise<LeverageInfo>;
  
  setLeverage(params: LeverageInfo): void;


  //  Account Orders
  // ---------------------------------------------------------------------------------------------------

  getAllOrders(params: GetOrdersRequest): Promise<Order[]>;

  getOpenOrders(params: GetOpenOrdersRequest): Promise<Order[]>;

  getOrder(params: GetOrderRequest): Promise<Order>;

  // getAccountTradeList(params: GetOrdersRequest): Promise<Order[]>;


  //  Trade Orders
  // ---------------------------------------------------------------------------------------------------

  postOrder(params: PostOrderRequest): Promise<Order>;

  cancelOrder(params: CancelOrderRequest): Promise<Order>;

  cancelAllSymbolOrders(symbol: SymbolType): Promise<Order>;

}
