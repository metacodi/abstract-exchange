import moment from 'moment';
import { Subscription } from 'rxjs';

import { OrdersExecutor } from './orders-executor';
import { ExchangeAccount } from './exchange-account';
import { GetOpenOrdersRequest, CancelOrderRequest, GetHistoryOrdersRequest, GetOrderRequest, PostOrderRequest } from './exchange-api-types';


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

export type StopType = 'normal' | 'profit' | 'loss' | 'profit-position' | 'loss-position';

export type TaskType = 'getHistoryOrders' | 'getOpenOrders' | 'getOrder' | 'postOrder' | 'cancelOrder';

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
  callback?: (success: any, failed?: any) => void;
}

export type OrderTask = GetHistoryOrdersTask | GetOpenOrdersTask | GetOrderTask | PostOrderTask | CancelOrderTask;

export interface GetHistoryOrdersTask extends Task {
  type: 'getHistoryOrders';
  data: {
    account: ExchangeAccount;
    controllerId: string;
    isTest: boolean;
    request: GetHistoryOrdersRequest;
  };
}

export interface GetOpenOrdersTask extends Task {
  type: 'getOpenOrders';
  data: {
    account: ExchangeAccount;
    controllerId: string;
    isTest: boolean;
    request: GetOpenOrdersRequest;
  };
}

export interface GetOrderTask extends Task {
  type: 'getOrder';
  data: {
    account: ExchangeAccount;
    controllerId: string;
    isTest: boolean;
    request: GetOrderRequest;
  };
}

export interface PostOrderTask extends Task {
  type: 'postOrder';
  data: {
    account: ExchangeAccount;
    controllerId: string;
    isTest: boolean;
    request: PostOrderRequest;
  };
}

export interface CancelOrderTask extends Task {
  type: 'cancelOrder';
  data: {
    account: ExchangeAccount;
    controllerId: string;
    isTest: boolean;
    request: CancelOrderRequest;
  };
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
  tradeAmountAsset?: 'base' | 'quote';
  minTradeAmount?: number;
  maxTradeAmount?: number;
  // baseAssetPrecision?: number;
  commissionAsset?: 'base' | 'quote';
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
  // exchange: ExchangeType;
  // simulatorDataSource?: {
  //   /** El nom de l'arxiu (string) o directament un array amb els preus. */
  //   source: string | (number | 'up' | 'down')[];
  //   sourceType: 'price' | 'kline';
  //   /** Format de l'arxiu. Genèric si és un array de preus, binance si és el resultat del miniTicker. */
  //   format: 'generic' | 'binance';
  //   mode: SimulatorMode;
  //   /** Only for `interval` mode. */
  //   period?: number;
  //   baseQuantity?: number; // BNB
  //   quoteQuantity: number; // USDT
  //   commissionAsset?: CoinType;
  // };
  // market: MarketType;
  // symbol: SymbolType;
  // autoStart: boolean;
  // params: BaseStrategyParams;
  // differential?: number;
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
  price: number;
  leverage: number;
  unrealisedPnl: number;
  marginType: MarginMode;
  positionSide: PositionSide;
  liquidationPrice?: number;
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
  leverage?: number;
}

export interface PartialOrder {
  subscription?: Subscription;
  order: Order;
  accumulated: number;
  avgPrice: number;
  count: number;
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


export interface User {
  idreg: number;
  idRole: number;
  idAbstractRole: number;
  idLang: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  telefono2: string;
  email: string;
  validated: boolean;
  pin: any;
  role: Role;
  device: Device;
}

export interface Role {
  idreg: number;
  name: string;
}

export interface Device {
  idreg: number;
  idUser: number;
  ip: string;
  deviceToken: string;
  apiToken: string;
  uuid: string;
  description: string;
  info: string;
  lastLogin: string;
  lat: number;
  lng: number;
  security: {
    idreg: number;
    idUser: number;
    idDevice: number;
    allowStoreCredentials: boolean;
    allowBiometricValidation: boolean;
    sendEmailOnNewDevice: boolean;
    sendPushOnNewDevice: boolean;
    sendEmailOnChangeIp: boolean;
    sendPushOnChangeIp: boolean;
  };
  notifications: {
    idreg: number;
    idUser: number;
    idDevice: number;
    allowPushNotifications: boolean;
    allowSonidoPush: boolean;
    sonidoPush: string;
  };
}


export interface ErrorObject {
  code?: number;
  message: string,
  data?: any;
};


export interface Bot {
  idreg: number;
  url: string;
  port: number;
  ip: string;
  accounts?: {
    idUser: number;
    userOperations: Partial<UserOperation>[];
    error?: { [type: string]: ErrorObject };
  }[];
  exchanges?: BotExchange[];
  // Propietats que no formen part de la fila de la base de dades.
  connected?: boolean;
};

export interface BotExchange {
  exchanges: ExchangeType;
  maxAccounts: number;
}


export interface Operation {
  idreg: 'new' | number;
  idStrategy: number;
  idCreador: number;
  params: { [key: string]: any };
  isTest: boolean;
  exchange: ExchangeType;
  market: MarketType;
  quoteAsset: CoinType;
  baseAsset: CoinType;
  accounts?: UserOperation[];
  users?: User[];
  strategy?: Strategy;
};

export interface UserOperation {
  idreg: 'new' | number;
  idUser: number;
  idOperation: 'new' | number;
  idBot: number;
  autoStart: boolean;
  started: string;
  finished: string;
  instances: InstanceController[];
  results: UserOperationResult;
  user?: User;
  bot?: Bot;
  operation?: Operation;
  info?: AccountInfo;
  error?: { [type: string]: ErrorObject };
  ui?: {
    quoteBalance?: number;
    quoteInvestment?: number;
    baseInvestment?: number;
    profitAmount?: number;
    profitPercent?: number;
    icon?: string;
    iconColor?: string;
  };
};

export type UserOperationStatus = 'initial' | 'market' | 'activated' | 'closed';

export interface UserOperationResult {
  status: UserOperationStatus;
  openPrice?: number;
  openQuantity?: number;
  closePrice?: number;
  pnl?: number;
  openCommission?: number;
  closeCommission?: number;
  profit?: number;
}

export const userOperationParse = (row: UserOperation): UserOperation => {
  if (typeof row.instances === 'string') {
    row.instances = JSON.parse(row.instances) as InstanceController[];
  }
  if (typeof row.results === 'string') {
    row.results = JSON.parse(row.results) as UserOperationResult;
  }
  if (row.operation && typeof row.operation.params === 'string') {
    row.operation.params = JSON.parse(row.operation.params);
  }
  return row;
};

export const userOperationStringify = (row: UserOperation): UserOperation => {
  row.instances = JSON.stringify(row.instances) as any;
  row.results = JSON.stringify(row.results) as any;
  if (row.operation && typeof row.operation.params === 'object') {
    row.operation.params = JSON.stringify(row.operation.params) as any;
  }
  // const results: (keyof UserOperationResult)[] = [ 'status', 'openPrice', 'pnl' ];
  // const resultsObj = results.reduce((res: any, prop: keyof UserOperationResult) => ({ ...res, [prop]: row.results[prop] }), {});
  // row.results = JSON.stringify(resultsObj) as any;
  return row;
};
