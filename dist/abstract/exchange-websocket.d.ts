import { Subject } from "rxjs";
import { CoinType, KlineIntervalType, MarketKline, MarketPrice, MarketType, OrderEvent, SymbolType } from "./types";
import { WsConnectionState, WsStreamType, WsAccountUpdate, WsBalancePositionUpdate } from "./exchange-websocket-types";
export interface ExchangeWebsocket {
    status: WsConnectionState;
    get market(): MarketType;
    get streamType(): WsStreamType;
    get isTest(): boolean;
    connect(): void;
    reconnect(): void;
    close(): void;
    destroy(): void;
    accountUpdate(asset?: CoinType): Subject<WsAccountUpdate>;
    balancePositionUpdate(): Subject<WsBalancePositionUpdate>;
    orderUpdate(symbol?: SymbolType): Subject<OrderEvent>;
    priceTicker(symbol: SymbolType): Subject<MarketPrice>;
    klineTicker(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;
}
//# sourceMappingURL=exchange-websocket.d.ts.map