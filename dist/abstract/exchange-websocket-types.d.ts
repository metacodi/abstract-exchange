import { AssetInfo, Position } from "./exchange-api-types";
import { CoinType, MarginMode, MarketType, PositionSide, SymbolType } from "./types";
export declare type WsConnectionState = 'initial' | 'connecting' | 'login' | 'connected' | 'reconnecting' | 'closing';
export declare type WsStreamType = 'user' | 'market';
export declare type WsUserStreamEmitterType = 'accountUpdate' | 'balancePositionUpdate' | 'marginCall' | 'accountConfigUpdate' | 'orderUpdate';
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
export interface WsBalancePositionUpdate {
    eventType: 'balancePositionUpdate';
    eventTime: string;
    balance?: {
        asset: CoinType;
        balanceAmount: number;
        updateTime: string;
    };
    position?: {
        symbol: SymbolType;
        positionAmount: number;
        entryPrice: number;
        positionSide: PositionSide;
        marginType: MarginMode;
        updateTime: string;
    };
}
//# sourceMappingURL=exchange-websocket-types.d.ts.map