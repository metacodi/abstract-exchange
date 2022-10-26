import { Subject } from "rxjs";
import { KlineIntervalType, MarketKline, MarketPrice, MarketType, Order, SymbolType } from "./types";
import { ExchangeApi } from "./exchange-api";
import { WsConnectionState, WsStreamType, WsAccountUpdate } from "./exchange-websocket-types";
export interface ExchangeWebsocket {
    status: WsConnectionState;
    api: ExchangeApi;
    initialize(): Promise<void>;
    get market(): MarketType;
    get streamType(): WsStreamType;
    get isTest(): boolean;
    connect(): Promise<void>;
    reconnect(): Promise<void>;
    close(): Promise<void>;
    destroy(): void;
    priceTicker(symbol: SymbolType): Subject<MarketPrice>;
    klineTicker(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;
    accountUpdate(symbol?: SymbolType): Subject<WsAccountUpdate>;
    orderUpdate(symbol?: SymbolType): Subject<Order>;
}
//# sourceMappingURL=exchange-websocket.d.ts.map