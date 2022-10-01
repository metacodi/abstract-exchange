import moment from 'moment';
import { Subscription } from 'rxjs';

import { OrdersExecutor } from './orders-executor';
import { AbstractAccount } from './abstract-account';


export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiCredentials { apiKey: string, apiSecret: string, apiPassphrase?: string };

export type ExchangeType = 'simulator' | 'binance' | 'kucoin' | 'okx' | 'bitget' | 'gate-io' | 'xt-com';

export type MarketType = 'spot' | 'futures' | 'margin';

export type OrderSide = 'buy' | 'sell';

export type TradeDirection = 'long' | 'short';

export type PreviousOrderStatus = 'post' | 'cancel';
// NOTA: Estats finals no han incloure els estats intermitjos com 'partial', 'cancelling'
export type ResultOrderStatus = 'new' | 'filled' | 'canceled' | 'partial' | 'unsatisfied' | 'expired' | 'rejected';
export type OrderStatus = PreviousOrderStatus | ResultOrderStatus;

export type KlineIntervalType = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';

/**
 * Order types
 * {@link https://binance-docs.github.io/apidocs/spot/en/#new-order-trade Spot}
 * {@link https://binance-docs.github.io/apidocs/futures/en/#new-order-trade Futures}
 */
export type AvailableOrderTypes = 'market' | 'limit' | 'stop' | 'stop_loss_limit' | 'limit_market' | 'stop_market' | 'oco';
export type OrderType = Extract<'market' | 'limit' | 'stop' | 'stop_loss_limit' | 'limit_market' | 'stop_market' | 'oco', AvailableOrderTypes>;

export type TaskType = 'getOrder' | 'postOrder' | 'cancelOrder';

export type CoinType = 'BNB' | 'BTC' | 'ETC' | 'USDT' | 'EUR';
export type CoinBaseType = Extract<CoinType, 'BNB' | 'BTC' | 'ETC'>;
export const acceptedCoins: CoinType[] = ['BNB', 'BTC', 'ETC', 'USDT', 'EUR'];

export type SymbolType = `${CoinBaseType}_${'USDT'}`;
export const acceptedSymbols: SymbolType[] = ['BNB_USDT', 'BTC_USDT', 'ETC_USDT'];

export interface Task {
  type: TaskType;
  data: { [key: string]: any };
}

export interface OrderTask extends Task {
  type: TaskType;
  data: { account: AbstractAccount; controllerId: string; order: Order; };
}

export interface MarketSymbol {
  symbol: SymbolType;
  ready: boolean;
  quotePrecision?: number;
  basePrecision?: number;
  quantityPrecision?: number;
  pricePrecision?: number;
  // baseAssetPrecision?: number;
}

export interface MarketPrice {
  symbol?: SymbolType;
  price: number;
  timestamp?: string;
  baseVolume?: number;  // BNB
  quoteVolume?: number; // USDT
}

export interface OrderBookPrice {
  symbol?: SymbolType;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  timestamp?: string;
}

export type SimulatorMode = 'interval' | 'tickPrice';

export interface MarketKline {
  symbol?: SymbolType;
  interval?: KlineIntervalType;
  open: number;
  close: number;
  high: number;
  low: number;
  openTime: string;
  closeTime?: string;     // Only Binance
  quoteVolume: number;  // USDT
  baseVolume?: number;  // BNB
}

export interface SimulationData {
  t: "F" | "P" | "B" | "O" | "R";
  i: number;
  d: {
    [key: string]: any;
  };
}

export interface Strategy {
  idreg: number;
  controller: string;
  description: string;
  exchange: ExchangeType;
  simulatorDataSource?: {
    /** El nom de l'arxiu (string) o directament un array amb els preus. */
    source: string | (number | 'up' | 'down')[];
    sourceType: 'price' | 'kline';
    /** Format de l'arxiu. Genèric si és un array de preus, binance si és el resultat del miniTicker. */
    format: 'generic' | 'binance';
    mode: SimulatorMode;
    /** Only for `interval` mode. */
    period?: number;
    baseQuantity?: number; // BNB
    quoteQuantity: number; // USDT
    commissionAsset?: CoinType;
  };
  market: MarketType;
  symbol: SymbolType;
  baseAsset: CoinType;
  quoteAsset: CoinType;
  autoStart: boolean;
  params: BaseStrategyParams;
  differential?: number;
}


export interface AccountInfo {
  idreg: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
  folder: string;
  token?: string;
}

export interface AccountMarket {
  balances: { [CoinType: string]: Balance; };
  orders: Order[];
  executor: OrdersExecutor;
  /** Futures: preu promig de totes les compres de base asset. */
  averagePrices: { [SymbolType: string]: number };
}

export type AccountEventType = 'accountReady' | 'accountUpdate';

export type AccountEvent = AccountReadyStatus | AccountUpdate;

export interface AccountReadyStatus {
  type: 'accountReady';
  ready: boolean;
}

export interface AccountUpdate {
  type: 'accountUpdate';
  market: MarketType;
  balances: Balance[];
}

export type BalanceUpdateType = 'deposit' | 'withdraw' | 'order';

export interface BalanceUpdateResult {
  update: BalanceUpdateType;
  market: MarketType;
  timestamp?: string;
  balance: Balance[];
}

export interface Balance {
  asset: CoinType;
  /** Quantitat total = available + locked. */
  balance: number;
  /** Spot: Quantitat disponible. */
  available?: number;
  /** Spot only: Destinat a les ordres (no disponible). */
  locked?: number;
  /** Quantitat despreciat durant l'arrodoniment basat en la precissió. */
  remainder?: number;
  /** Comissions acumulades. */
  fee?: number;
}

export interface FundingWallet {
  asset: string;
  free: number;
  locked: number;
  freeze: number;
  withdrawing: number;
  btcValuation: number;
}

export interface OrderId {
  accountId: number;
  strategyId: number;
  instanceId: number;
  orderId: number;
  ocoId?: string;
}

export interface Order {
  /** Binance clientOrderId pattern `^[\.A-Z\:/a-z0-9_-]{1,36}$` */
  id: string;
  exchangeId: number;     // orderId propi de l'exchange
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  symbol: SymbolType;
  baseQuantity?: number;   // quantitat satifeta baseAsset
  quoteQuantity?: number;  // quantitat satifeta quoteAsset
  price?: number;
  stopPrice?: number;      // preu per les ordres de tipus stop-limit.
  // stopMarket?: number;      // preu per les ordres de tipus stop-limit.
  isOco?: boolean;
  created?: string;
  posted?: string;
  executed?: string;
  syncronized?: boolean;
  idOrderBuyed?: string;
  profit?: number;        // Futures only
}

export interface OrderEvent {
  // order: Omit<Required<Order>, 'side' |'type' | 'symbol' | 'stopMarket' | 'isOco' | 'created' | 'syncronized'>;
  // order: Partial<Order>;
  order: Order;
  data: { [key: string]: any };
}


export interface PartialOrder {
  subscription?: Subscription,
  order: Order,
  accumulated: number,
  count: number,
}


export interface BaseStrategyParams {
  isPercentInvestment?: boolean;
  investment?: number;
  market?: MarketType;
  /** Apalancament a futurs. */
  leverage?: number;
}

export interface InstanceController {
  id: number;
  created: string;
  updated: string;
  /** Contador d'ordres. S'inicia en 0 i es va incrementant a partir de la primera ordre creada. */
  lastOrderId: number;
  orders: Order[];
  balances: { [key: string]: Balance; };
}



