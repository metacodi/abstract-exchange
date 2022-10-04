import { AssetInfo, Position } from "./exchange-api-types";
import { CoinType, MarginMode, MarketType, OrderSide, OrderStatus, OrderType, PositionSide, PreviousOrderStatus, ResultOrderStatus, SymbolType } from "./types";


export type WsConnectionState = 'initial' | 'connecting' | 'login' | 'connected' | 'reconnecting' | 'closing';

export type WsStreamType = 'user' | 'market';

export type WsUserStreamEmitterType = 'accountUpdate' | 'balancePositionUpdate' | 'marginCall' | 'accountConfigUpdate' | 'orderUpdate';

export type WsMarketStreamEmitterType = 'priceTicker' | 'klineTicker';

export type WsStreamEmitterType = WsUserStreamEmitterType | WsMarketStreamEmitterType;

export interface WebsocketOptions {
  /** Market associat. */
  market: MarketType;
  /** Indica si l'stream és d'usuari o de mercat. */
  streamType: WsStreamType;
  /** Public user api key. */
  apiKey?: string;
  /** Private user api key. */
  apiSecret?: string;
  /** Private user pass phrase. */
  apiPassphrase?: string;
  /** Indica si l'api està en mode test o en real. */
  isTest?: boolean,
  /** Indica el periode de delay abans de tornar a connectar. */
  reconnectPeriod?: number;
  /** Temps en milisegons per l'interval qua ha de manetenir viva la connexió. */
  pingInterval?: number;
  /** Temps en milisegons pel timeout si no hi ha la resposta per part del servidor. */
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

// export interface Position {
//   symbol: SymbolType;
//   marginAsset?: CoinType; // (margin only)
//   positionAmount: number;
//   entryPrice: number;
//   accumulatedRealisedPreFee: number;
//   unrealisedPnl: number;
//   marginType: MarginMode;
//   isolatedWalletAmount: number;
//   positionSide: PositionSide;
// }

// export interface WsOrderUpdate {
//   eventType: 'orderUpdate';
//   eventTime: string;
//   id: string;
//   exchangeId: number;     // orderId propi de l'exchange
//   side: OrderSide;
//   type: OrderType;
//   previousStatus: PreviousOrderStatus;
//   status: ResultOrderStatus;
//   symbol: SymbolType;
//   baseQuantity?: number;   // quantitat satifeta baseAsset
//   quoteQuantity?: number;  // quantitat satifeta quoteAsset
//   price?: number;
//   stopPrice?: number;      // preu per les ordres de tipus stop-limit.
//   rejectReason: string;

//   isOco?: boolean;
//   created?: string;
//   posted?: string;
//   executed?: string;
//   syncronized?: boolean;
//   idOrderBuyed?: string;
//   profit?: number;        // Futures only

//   // lastTradeQuantity: number;
//   // accumulatedQuantity: number;
//   // lastTradePrice: number;
//   // commission: number;
//   // commissionAsset: string | null;
//   // tradeTime: number;
//   // tradeId: number;
//   // isOrderOnBook: boolean;
//   // isMaker: boolean;
//   // orderCreationTime: number;
//   // cumulativeQuoteAssetTransactedQty: number;
//   // lastQuoteAssetTransactedQty: number;
//   // orderQuoteQty: number;
// }

