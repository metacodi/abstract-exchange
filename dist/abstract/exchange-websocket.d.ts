import { Subject } from "rxjs";
import { CoinType, KlineIntervalType, MarketKline, MarketPrice, MarketType, Order, SymbolType } from "./types";
import { WsStreamType, WsAccountUpdate } from "./exchange-websocket-types";
export interface ExchangeWebsocket {
    get market(): MarketType;
    get streamType(): WsStreamType;
    get isTest(): boolean;
    connect(): void;
    reconnect(): void;
    close(): void;
    destroy(): void;
    priceTicker(symbol: SymbolType): Subject<MarketPrice>;
    klineTicker(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;
    accountUpdate(asset?: CoinType): Subject<WsAccountUpdate>;
    orderUpdate(symbol?: SymbolType): Subject<Order>;
}
//# sourceMappingURL=exchange-websocket.d.ts.map