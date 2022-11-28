import { Balance, CoinType, MarginMode, MarketType, OrderSide, OrderStatus, OrderType, Position, PositionSide, PreviousOrderStatus, ResultOrderStatus, SymbolType } from "./types";


export type WsConnectionState = 'initial' | 'connecting' | 'login' | 'connected' | 'reconnecting' | 'closing';

export type WsStreamType = 'user' | 'market';

// export type WsUserStreamEmitterType = 'accountUpdate' | 'balancePositionUpdate' | 'marginCall' | 'accountConfigUpdate' | 'orderUpdate';

// export type WsMarketStreamEmitterType = 'priceTicker' | 'klineTicker';

// export type WsStreamEmitterType = WsUserStreamEmitterType | WsMarketStreamEmitterType;

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
  eventTime?: string;
  balances?: Balance[];
  positions?: Position[];
}

