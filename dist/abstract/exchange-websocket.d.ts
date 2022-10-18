import { Subject } from "rxjs";
import { KlineIntervalType, MarketKline, MarketPrice, MarketType, Order, SymbolType } from "./types";
import { WsStreamType, WsAccountUpdate } from "./exchange-websocket-types";
export interface ExchangeWebsocket {
    initialize(): Promise<void>;
    get market(): MarketType;
    get streamType(): WsStreamType;
    get isTest(): boolean;
    connect(): void;
    reconnect(): void;
    close(): void;
    destroy(): void;
    priceTicker(symbol: SymbolType): Subject<MarketPrice>;
    klineTicker(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;
    accountUpdate(symbol?: SymbolType): Subject<WsAccountUpdate>;
    orderUpdate(symbol?: SymbolType): Subject<Order>;
}
//# sourceMappingURL=exchange-websocket.d.ts.map