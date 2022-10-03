import { AssetInfo, Position } from "./exchange-api-types";
import { MarketType } from "./types";
export declare type WsConnectionState = 'initial' | 'connecting' | 'connected' | 'reconnecting' | 'closing';
export declare type WsStreamType = 'user' | 'market';
export declare type WsUserStreamEmitterType = 'accountUpdate' | 'balanceUpdate' | 'marginCall' | 'accountConfigUpdate' | 'orderUpdate';
export declare type WsMarketStreamEmitterType = 'priceTicker' | 'klineTicker';
export declare type WsStreamEmitterType = WsUserStreamEmitterType | WsMarketStreamEmitterType;
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
    eventType: 'accountUpdate';
    eventTime: string;
    balances: AssetInfo[];
    positions?: Position[];
}
export interface WsBalanceUpdate {
    eventType: 'balanceUpdate';
    eventTime: string;
    asset: string;
    balanceDelta: number;
    clearTime: number;
}
//# sourceMappingURL=exchange-websocket-types.d.ts.map