import { MarketType, MarketPrice, MarginMode, MarketKline, Order, SymbolType, MarketSymbol } from './types';
import { AccountInfo } from './types';
import { ExchangeInfo, GetHistoryOrdersRequest, GetOrderRequest, KlinesRequest, LeverageInfo, PostOrderRequest, CancelOrderRequest, ApiOptions, SetLeverage } from './exchange-api-types';
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
    getKlines(params: KlinesRequest): Promise<MarketKline[]>;
    getAccountInfo(): Promise<AccountInfo>;
    getLeverage(symbol: SymbolType, mode?: MarginMode): Promise<LeverageInfo>;
    setLeverage(params: SetLeverage): Promise<void>;
    getHistoryOrders(params: GetHistoryOrdersRequest): Promise<Order[]>;
    getOpenOrders(symbol: SymbolType): Promise<Order[]>;
    getOrder(params: GetOrderRequest): Promise<Order>;
    postOrder(params: PostOrderRequest): Promise<Order>;
    cancelOrder(params: CancelOrderRequest): Promise<Order>;
}
//# sourceMappingURL=exchange-api.d.ts.map