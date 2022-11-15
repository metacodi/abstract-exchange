import { BehaviorSubject, Subject, timer } from 'rxjs';

import { Limit, LimitType, TaskExecutor } from '../utils/task-executor';
import { ExchangeAccount } from './exchange-account';
import { AccountEvent, AccountReadyStatus, Balance, SymbolType, CoinType, ExchangeType, KlineIntervalType, MarketKline, MarketPrice, MarketSymbol, MarketType } from './types';
import { Order, OrderBookPrice, OrderTask, PartialOrder, ResultOrderStatus } from './types';
import { splitOrderId } from './shared';
import { ExchangeWebsocket } from './exchange-websocket';
import { ExchangeApi } from './exchange-api';
import { WsAccountUpdate } from './exchange-websocket-types';
import { ExchangeInfo, PostOrderRequest } from './exchange-api-types';
import moment from 'moment';


export abstract class AbstractExchange extends TaskExecutor {
  /** Notifiquem el nou límit d'ordres que correspon actualitzar a cada controlador. */
  ordersLimitsChanged = new BehaviorSubject<Limit>(undefined);

  constructor(
    public market: MarketType,
  ) {
    super({ run: 'async', maxQuantity: 5, period: 1 }); // spot request limit ratio 20/s
  }
  
  // ---------------------------------------------------------------------------------------------------
  //  orders tasks
  // ---------------------------------------------------------------------------------------------------
  
  do(task: OrderTask) { super.do(task); }

  getOrder(task: OrderTask): void { this.do(task); }

  postOrder(task: OrderTask): void { this.do(task); }

  cancelOrder(task: OrderTask): void { this.do(task); }

}
