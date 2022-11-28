import { MarketType, MarketPrice, MarginMode, MarketKline, Order, SymbolType, MarketSymbol } from './types';
import { AccountInfo } from './types';
import { ExchangeInfo, GetHistoryOrdersRequest, GetOrderRequest, KlinesRequest, LeverageInfo, PostOrderRequest, CancelOrderRequest, ApiOptions, SetLeverage, GetOpenOrdersRequest } from './exchange-api-types';
export interface ExchangeApi {
    market: MarketType;
    options: ApiOptions;
    get apiKey(): string;
    get apiSecret(): string;
    get apiPassphrase(): string;
    get isTest(): boolean;
    setCredentials(data: {
        apiKey: string;
        apiSecret: string;
        apiPassphrase?: string;
    }): void;
    get defaultOptions(): Partial<ApiOptions>;
    getExchangeInfo(): Promise<ExchangeInfo>;
    getMarketSymbol(symbol: SymbolType): Promise<MarketSymbol>;
    getPriceTicker(symbol: SymbolType): Promise<MarketPrice>;
    getKlines(request: KlinesRequest): Promise<MarketKline[]>;
    getAccountInfo(): Promise<AccountInfo>;
    getLeverage(symbol: SymbolType, mode?: MarginMode): Promise<LeverageInfo>;
    setLeverage(request: SetLeverage): Promise<void>;
    getHistoryOrders(request: GetHistoryOrdersRequest): Promise<Partial<Order>[]>;
    getOpenOrders(request: GetOpenOrdersRequest): Promise<Partial<Order>[]>;
    getOrder(request: GetOrderRequest): Promise<Partial<Order>>;
    postOrder(request: PostOrderRequest): Promise<Order>;
    cancelOrder(request: CancelOrderRequest): Promise<Order>;
    fixPrice(price: number): number;
    fixQuantity(quantity: number): number;
    fixBase(base: number): number;
    fixQuote(quote: number): number;
}
//# sourceMappingURL=exchange-api.d.ts.map