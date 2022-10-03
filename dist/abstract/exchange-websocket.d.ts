import { Subject } from "rxjs";
import { KlineIntervalType, MarketKline, MarketPrice, MarketType, OrderEvent } from "./types";
import { WsConnectionState, WsStreamType, WsAccountUpdate, WsBalanceUpdate } from "./exchange-websocket-types";
export interface ExchangeWebsocket {
    status: WsConnectionState;
    get market(): MarketType;
    get streamType(): WsStreamType;
    get isTest(): boolean;
    connect(): void;
    reconnect(): void;
    close(): void;
    destroy(): void;
    accountUpdate(): Subject<WsAccountUpdate>;
    balanceUpdate(): Subject<WsBalanceUpdate>;
    orderUpdate(): Subject<OrderEvent>;
    priceTicker(symbol: string): Subject<MarketPrice>;
    kline(symbol: string, interval: KlineIntervalType): Subject<MarketKline>;
}
//# sourceMappingURL=exchange-websocket.d.ts.map