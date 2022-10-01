import { BehaviorSubject, Subject, timer } from "rxjs";

import { Limit, TaskExecutor } from "./task-executor";
import { AbstractAccount } from "./abstract-account";
import { AccountEvent, ExchangeType, KlineIntervalType, MarketKline, MarketPrice, MarketSymbol, MarketType, Order, OrderBookPrice, OrderEvent, OrderTask, PartialOrder, ResultOrderStatus, SymbolType } from "./types";
import { splitOrderId } from "./shared";


export abstract class AbstractExchange extends TaskExecutor {

  limitRequest: Limit;
  limitOrders: Limit;
  symbols: MarketSymbol[] = [];

  symbolsInitialized = new BehaviorSubject<SymbolType[]>(undefined);
  ordersLimitsChanged = new BehaviorSubject<Limit>(undefined);
  marketSymbolStatusChanged = new BehaviorSubject<MarketSymbol>(undefined);
  
  marketKlineSubjects: { [SymbolType: string]: Subject<MarketKline> } = {};
  marketPriceSubjects: { [SymbolType: string]: Subject<MarketPrice> } = {};
  accountEventsSubjects: { [accountId: string]: Subject<AccountEvent> } = {};
  ordersEventsSubjects: { [controllerId: string]: Subject<OrderEvent> } = {};

  partialPeriod = 1000 * 10; // 10 s
  partials: { [orderId: string]: PartialOrder } = {};

  abstract exchange: ExchangeType;

  constructor(
    public market: MarketType,
  ) {
    super({ run: 'async', maxQuantity: 5, period: 1 }); // spot request limit ratio 20/s

    // Donem temps pq el controlador es pugui instanciar i establir les subscripcions amb l'exchange.
    setTimeout(() => this.retrieveExchangeInfo(), 100);
  }


  // ---------------------------------------------------------------------------------------------------
  //  Exchange info
  // ---------------------------------------------------------------------------------------------------

  protected abstract retrieveExchangeInfo(): void;

  protected abstract retrieveAcountInfo(account: AbstractAccount): Promise<boolean>;


  // ---------------------------------------------------------------------------------------------------
  //  market
  // ---------------------------------------------------------------------------------------------------

  getMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice> {
    if (this.marketPriceSubjects[symbol]) {
      return this.marketPriceSubjects[symbol];
    } else {
      return this.createMarketPriceSubject(symbol);
    }
  }
  
  protected abstract createMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice>;
  
  abstract getMarketPrice(symbol: SymbolType): Promise<MarketPrice>;
  
  abstract getOrderBookTicker(symbol: SymbolType): Promise<OrderBookPrice>;

  getMarketKlineSubject(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline> {
    if (this.marketKlineSubjects[`${symbol}_${interval}`]) {
      return this.marketKlineSubjects[`${symbol}_${interval}`];
    } else {
      return this.createMarketKlineSubject(symbol, interval);
    }
  }

  protected abstract createMarketKlineSubject(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline>;

  // ---------------------------------------------------------------------------------------------------
  //  account
  // ---------------------------------------------------------------------------------------------------

  getAccountEventsSubject(account: AbstractAccount, symbol?: SymbolType): Subject<AccountEvent> {
    const accountId = `${account.idreg}`;
    if (this.accountEventsSubjects[accountId]) {
      return this.accountEventsSubjects[accountId];
    } else {
      return this.createAccountEventsSubject(account, symbol);
    }
  }

  protected abstract createAccountEventsSubject(account: AbstractAccount, symbol?: SymbolType): Subject<AccountEvent>;


  // ---------------------------------------------------------------------------------------------------
  //  orders tasks
  // ---------------------------------------------------------------------------------------------------
  
  do(task: OrderTask) { super.do(task); }

  getOrder(task: OrderTask): void { this.do(task); }

  postOrder(task: OrderTask): void { this.do(task); }

  cancelOrder(task: OrderTask): void { this.do(task); }

  protected abstract getOrderTask(task: OrderTask): void;

  protected abstract postOrderTask(task: OrderTask): void;

  protected abstract cancelOrderTask(task: OrderTask): void;

  protected executeTask(task: OrderTask): Promise<any> {
    // logTime(`exec task ${task.type} ${task.data.order.id}`);
    switch (task.type) {
      case 'getOrder': this.getOrderTask(task); break;
      case 'postOrder': this.postOrderTask(task); break;
      case 'cancelOrder': this.cancelOrderTask(task); break;
      default:
        throw new Error(`No s'ha implementat la tasca de tipus '${task.type}'.`);
    }
    // NOTA: La promise només és necessària per a una execució seqüencial (sync) i estem en un paradigma async.
    return Promise.resolve();
  }

  protected processGetOrderTask(account: AbstractAccount, order: Order) {
    const { accountId, strategyId } = splitOrderId(order.id);
    const controllerId = `${accountId}-${strategyId}`;
    // Guardem l'ordre sol·licitada al mercat de l'exchange.
    account.markets[this.market].orders.push(order);
    // Notifiquem l'ordre obtinguda al controlador pq comprovi si pot iniciar l'activitat.
    this.ordersEventsSubjects[controllerId].next({ order, data: {} });
  }


  // ---------------------------------------------------------------------------------------------------
  //  orders events
  // ---------------------------------------------------------------------------------------------------

  getOrdersEventsSubject(account: AbstractAccount, controllerId: string): Subject<OrderEvent> {
    if (this.ordersEventsSubjects[controllerId]) {
      return this.ordersEventsSubjects[controllerId];
    } else {
      const subject = new Subject<OrderEvent>();
      this.ordersEventsSubjects[controllerId] = subject;
      return subject;
    }
  }

  protected processOrderUpdate(account: AbstractAccount, event: OrderEvent) {
    const { accountId, strategyId } = splitOrderId(event.order.id);
    const controllerId = `${accountId}-${strategyId}`;
    const order = account.markets[this.market].orders.find(o => o.id === event.order.id);
    // Ignorem les ordres que no estiguin registrades al market.
    if (!order) { return; }
    // Actualitzem l'ordre respectant la mateixa instància que pot estar referènciada des de PartialOrder.
    Object.assign(order, event.order);
    if (event.order.status === 'partial') {
      // Si es tracta d'una 'PARTIALLY_FILLED', comprovar si s'ha d'engegar un timer o, si ja existeix, seguir acumulant i reiniciant el timer.
      this.processPartialFilled(account, order);

    } else {
      if (event.order.status === 'filled') { this.completePartialFilled(account, order); }
      // TODO: eliminar les ordres executades del account market.
      this.ordersEventsSubjects[controllerId].next({ order, data: event.data });
    }
  }

  protected processPartialFilled(account: AbstractAccount, order: Order) {
    if (!this.partials[order.id]) {
      this.partials[order.id] = { order, count: 0, accumulated: order.baseQuantity, subscription: undefined } as PartialOrder;
    }
    const partial = this.partials[order.id];
    if (partial.subscription) { partial.subscription.unsubscribe(); }
    partial.subscription = timer(this.partialPeriod).subscribe(() => this.notifyUnsatisfiedPartialOrder(account, partial));
    partial.accumulated += order.baseQuantity;
    partial.count += 1;
  }

  protected completePartialFilled(account: AbstractAccount, order: Order) {
    const stored = this.partials[order.id];
    if (!stored) { return; }
    // Aturem el timer.
    if (stored.subscription) { stored.subscription.unsubscribe(); }
    // Eliminem la info de PartialOrder.
    delete this.partials[order.id];
  }

  protected notifyUnsatisfiedPartialOrder(account: AbstractAccount, partial: PartialOrder) {
    // Aturem el timer.
    partial.subscription.unsubscribe();
    const order = partial.order;
    const { accountId, strategyId } = splitOrderId(order.id);
    const controllerId = `${accountId}-${strategyId}`;
    // const { id, exchangeId, type, side, quantity, accumulateQuantity, price, commission, commissionAsset } = order;
    const found = account.markets[this.market].orders.find(o => o.id === order.id);
    // Construim un resultat en estat 'unsatisfied'.
    order.status = 'unsatisfied';
    order.baseQuantity = partial.accumulated;
    // Eliminem la info de PartialOrder.
    delete this.partials[order.id];
    // Notifiquem el resultat.
    this.ordersEventsSubjects[controllerId].next({ order, data: {} });
  }


  // ---------------------------------------------------------------------------------------------------
  //  helpers
  // ---------------------------------------------------------------------------------------------------  

  protected isExecutedStatus(status: ResultOrderStatus): boolean { return status === 'new' || status === 'expired'; }

}
