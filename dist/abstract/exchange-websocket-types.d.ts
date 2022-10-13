import { Balance, MarketType, Position } from "./types";
export declare type WsConnectionState = 'initial' | 'connecting' | 'login' | 'connected' | 'reconnecting' | 'closing';
export declare type WsStreamType = 'user' | 'market';
export interface WebsocketOptions {
    market: MarketType;
    streamType: WsStreamType;
    apiKey?: string;
    apiSecret?: string;
    apiPassphrase?: string;
    isTest?: boolean;
    reconnectPeriod?: number;
    pingInterval?: number;
    pongTimeout?: number;
}
export interface WsAccountUpdate {
    eventTime?: string;
    balances?: Balance[];
    positions?: Position[];
}
//# sourceMappingURL=exchange-websocket-types.d.ts.map