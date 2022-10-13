import { Subject, Subscription } from "rxjs";

import { CoinType, KlineIntervalType, MarketKline, MarketPrice, MarketType, Order, SymbolType } from "./types";
import { ExchangeApi } from "./exchange-api";
import { WebsocketOptions, WsConnectionState, WsStreamType, WsAccountUpdate } from "./exchange-websocket-types";


export interface ExchangeWebsocket {
  // /** Estat de la connexió. */
  // status: WsConnectionState;
  // /** Opcions de configuració. */
  // options: WebsocketOptions;
  // /** Referència a la instància del websocket subjacent. */
  // ws: WebSocket
  // /** Referència a la instància del client API. */
  // api: ExchangeApi;
  // /** Subscripció al interval que envia un ping al servidor per mantenir viva la connexió.  */
  // pingTimer?: Subscription;
  // /** Subscriptor al timer que controla la resposta del servidor. */
  // pongTimer?: Subscription;
  // /** Emisors de missatges. */
  // emitters: { [WsStreamEmitterType: string]: Subject<any> };


  // ---------------------------------------------------------------------------------------------------
  //  options
  // ---------------------------------------------------------------------------------------------------

  get market(): MarketType;
  
  get streamType(): WsStreamType;

  // get apiKey(): string;

  // get apiSecret(): string;

  get isTest(): boolean;

  // get reconnectPeriod(): number;

  // get pingInterval(): number;

  // get pongTimeout(): number;

  // get defaultOptions(): Partial<WebsocketOptions>;


  // ---------------------------------------------------------------------------------------------------
  //  connect . terminate
  // ---------------------------------------------------------------------------------------------------

  // get url(): string;

  connect(): void;
  
  reconnect(): void;
  
  close(): void;
  
  destroy(): void;


  // // ---------------------------------------------------------------------------------------------------
  // //  ping . pong
  // // ---------------------------------------------------------------------------------------------------

  // ping(): void;


  // ---------------------------------------------------------------------------------------------------
  //  Market STREAM
  // ---------------------------------------------------------------------------------------------------

  priceTicker(symbol: SymbolType): Subject<MarketPrice>;
  
  klineTicker(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;

  // bookTicker(symbol: string): Subject<BookTicker>;
  

  // ---------------------------------------------------------------------------------------------------
  //  Account STREAMS
  // ---------------------------------------------------------------------------------------------------

  accountUpdate(asset?: CoinType): Subject<WsAccountUpdate>;
  
  // balancePositionpUdate(): Subject<WsBalancePositionUpdate>;
  
  // accountConfigUpdate(): Subject<WsAccountConfigUpdate>;
  
  orderUpdate(symbol?: SymbolType): Subject<Order>;

  // marginCall(): Subject<WsMarginCall>;


}
