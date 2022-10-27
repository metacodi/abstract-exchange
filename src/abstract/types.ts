import moment from 'moment';
import { Subscription } from 'rxjs';

import { OrdersExecutor } from './orders-executor';
import { ExchangeAccount } from './exchange-account';


export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ExchangeType = 'simulator' | 'binance' | 'kucoin' | 'okx' | 'bitget' | 'gate-io' | 'xt-com';

export type MarketType = 'spot' | 'futures' | 'margin';

/** buy <=> open | sell <=> close */
export type OrderSide = 'buy' | 'sell';

export type TradeSide = 'long' | 'short';

export type PreviousOrderStatus = 'post' | 'cancel';
// NOTA: Estats finals no han incloure els estats intermitjos com 'partial', 'cancelling'
export type ResultOrderStatus = 'new' | 'filled' | 'canceled' | 'partial' | 'unsatisfied' | 'expired' | 'rejected';
export type OrderStatus = PreviousOrderStatus | ResultOrderStatus;

export type KlineIntervalType = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';

export type MarginMode = 'cross' | 'isolated';

export type PositionSide = 'both' | 'long' | 'short';

/**
 * Order types
 * {@link https://binance-docs.github.io/apidocs/spot/en/#new-order-trade Spot}
 * {@link https://binance-docs.github.io/apidocs/futures/en/#new-order-trade Futures}
 */
export type OrderType = 'market' | 'limit';

export type StopType = 'normal' | 'profit' | 'loss';

export type TaskType = 'getOrder' | 'postOrder' | 'cancelOrder';

export type CoinType = 'BNB' | 'BTC' | 'ETC' | 'USDT' | 'USDC' | 'USD' | 'EUR';
// export type CoinBaseType = Extract<CoinType, 'BNB' | 'BTC' | 'ETC'>;
// export const acceptedCoins: CoinType[] = ['BNB', 'BTC', 'ETC', 'USDT', 'EUR'];

// export type SymbolType = `${CoinBaseType}_${'USDT'}`;
// export const acceptedSymbols: SymbolType[] = ['BNB_USDT', 'BTC_USDT', 'ETC_USDT'];

export interface SymbolType {
  baseAsset: CoinType;
  quoteAsset: CoinType;
}

export interface Task {
  type: TaskType;
  data: { [key: string]: any };
}

export interface OrderTask extends Task {
  type: TaskType;
  data: { account: ExchangeAccount; controllerId: string; order: Order; };
}

export interface MarketSymbol {
  symbol: SymbolType;
  ready: boolean;
  quotePrecision?: number;
  basePrecision?: number;
  quantityPrecision?: number;
  pricePrecision?: number;
  /** La quantitat ha de ser d'aquest múltiple. */
  sizeMultiplier?: number;
  tradeCommission?: 'base' | 'quote';
  minTradeAmount?: number;
  maxTradeAmount?: number;
  // baseAssetPrecision?: number;
  assetCommission?: 'base' | 'quote';
  makerCommission?: number;
  takerCommission?: number;
  longLeverage?: number;
  shortLeverage?: number;
  minLeverage?: number;
  maxLeverage?: number;
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
  autoStart: boolean;
  params: BaseStrategyParams;
  differential?: number;
}


export interface UserAccount {
  idreg: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  email: string;
  password: string;
  folder: string;
  token?: string;
}

export interface AccountInfo {
  // makerCommission: number;
  // takerCommission: number;
  // buyerCommission: number;
  // sellerCommission: number;
  canTrade?: boolean;
  canWithdraw?: boolean;
  canDeposit?: boolean;
  // updateTime: number;
  // accountType: MarketType;
  balances?: Balance[];
  positions?: Position[];
  // permissions: MarketType[];
}

export interface Balance {
  asset: CoinType;
  /** Quantitat total = available + locked. */
  balance?: number;
  /** Quantitat disponible. */
  available?: number;
  /** Destinat a les ordres de límit. */
  locked?: number;
  /** Quantitat despreciat durant l'arrodoniment basat en la precissió. */
  remainder?: number;
  /** Comissions acumulades durant l'operativa del controlador. */
  fee?: number;
}

export interface Position {
  symbol: SymbolType;
  marginAsset?: CoinType;
  positionAmount: number;
  entryPrice: number;
  unrealisedPnl: number;
  marginType: MarginMode;
  positionSide: PositionSide;
}

export interface AccountMarket {
  balances: { [CoinType: string]: Balance; };
  positions?: { [CoinType: string]: Position; };
  orders: Order[];
  executor: OrdersExecutor;
  /** Futures: preu promig de totes les compres de base asset. */
  averagePrices: { [ symbolKey: string]: number };
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
  exchangeId: string;     // orderId propi de l'exchange
  side: OrderSide;
  type: OrderType;
  stop?: StopType;
  trade?: TradeSide;
  status: OrderStatus;
  symbol?: SymbolType;
  baseQuantity?: number;   // quantitat satifeta baseAsset
  quoteQuantity?: number;  // quantitat satifeta quoteAsset
  price?: number;           // preu per les ordres de tipus limit, les market l'ignoren pq ja entren a mercat.
  stopPrice?: number;       // preu per avtivar l'stop.
  rejectReason?: string;
  isOco?: boolean;
  created?: string;       // timestamp: moment de creació per part de la nostra app.
  posted?: string;        // timestamp: moment de creació a l'exchange (Binance, Kucoin, ...)
  executed?: string;      // timestamp: moment en que s'ha filled o canceled.
  syncronized?: boolean;
  idOrderBuyed?: string;
  profit?: number;        // Futures only
  commission?: number;
  commissionAsset?: CoinType;
  fillPrice?: number;
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



