import { Subject, Subscription } from "rxjs";

import { KlineIntervalType, MarketKline, MarketPrice, MarketType, OrderEvent, SymbolType } from "./types";
import { ExchangeApi } from "./exchange-api";
import { WebsocketOptions, WsConnectionState, WsStreamType, WsAccountUpdate, WsBalanceUpdate } from "./exchange-websocket-types";


export interface ExchangeWebsocket {
  // /** Opcions de configuració. */
  // options: WebsocketOptions;
  // /** Referència a la instància del websocket subjacent. */
  // ws: WebSocket
  // /** Referència a la instància del client API. */
  // api: ExchangeApi;
  /** Estat de la connexió. */
  status: WsConnectionState;
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
  
  /** Ex: `FUTURES-2310` | `COIN-USDM` | `COIN-M` */
  get marketName(): string;

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
  //  Account STREAMS
  // ---------------------------------------------------------------------------------------------------

  accountUpdate(): Subject<WsAccountUpdate>;
  
  balanceUpdate(): Subject<WsBalanceUpdate>;
  
  // accountConfigUpdate(): Subject<WsAccountConfigUpdate>;
  
  orderUpdate(): Subject<OrderEvent>;
  
  // marginCall(): Subject<WsMarginCall>;


  // ---------------------------------------------------------------------------------------------------
  //  Market STREAM
  // ---------------------------------------------------------------------------------------------------

  priceTicker(symbol: SymbolType): Subject<MarketPrice>;
  
  klineTicker(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;

  // bookTicker(symbol: string): Subject<BookTicker>;


}
