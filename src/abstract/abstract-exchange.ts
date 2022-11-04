import { BehaviorSubject, Subject, timer } from "rxjs";

import { Limit, LimitType, TaskExecutor } from "./task-executor";
import { ExchangeAccount } from "./exchange-account";
import { AccountEvent, AccountReadyStatus, Balance, SymbolType, CoinType, ExchangeType, KlineIntervalType, MarketKline, MarketPrice, MarketSymbol, MarketType } from "./types";
import { Order, OrderBookPrice, OrderTask, PartialOrder, ResultOrderStatus } from "./types";
import { splitOrderId } from "./shared";
import { ExchangeWebsocket } from "./exchange-websocket";
import { ExchangeApi } from "./exchange-api";
import { WsAccountUpdate } from "./exchange-websocket-types";
import { ExchangeInfo, PostOrderRequest } from "./exchange-api-types";
import moment from "moment";


export abstract class AbstractExchange extends TaskExecutor {
  /** Nombre del exchange */
  name: ExchangeType;
  /** Referència a la instància de l'API. */
  abstract get marketApi(): ExchangeApi;
  /** Referència al websockets pel market stream. */
  abstract get marketWs(): ExchangeWebsocket;
  /** Referencies als websockets de cada compte. */
  accountWs: { [accounId: string]: ExchangeWebsocket } = {};
  /** Colección de símbolos del exchange. */
  symbols: MarketSymbol[] = [];
  /** Límite de request del exchange. */
  limitRequest: Limit;
  /** Límite de órdenes del exchange. */
  limitOrders: Limit;
  /** Alguns exchanges com Bitget no informen del locked. Donat el cas, haurem de calcular-lo en cada orderUpdate. */
  balanceLocketIsMissing = true;

  /** Indica quan s'han carregat les dades de l'exchange per primera vegada. */
  isReady = false;
  /** Notifica una actualització de les dades de l'exchange pq els controladors facin les seves actualitzacions. */
  exchangeInfoUpdated = new Subject<void>();
  /** Notifiquem el nou límit d'ordres que correspon actualitzar a cada controlador. */
  ordersLimitsChanged = new BehaviorSubject<Limit>(undefined);
  
  marketKlineSubjects: { [symbolKey_Interval: string]: Subject<MarketKline> } = {};
  marketPriceSubjects: { [symbolKey: string]: Subject<MarketPrice> } = {};
  accountEventsSubjects: { [accountId: string]: Subject<AccountEvent> } = {};
  ordersEventsSubjects: { [controllerId: string]: Subject<Order> } = {};

  partialPeriod = 1000 * 10; // 10 s
  /** Colecciona els timers per controlar les ordres parcialment satisfetes. */
  partials: { [orderId: string]: PartialOrder } = {};

  constructor(
    public market: MarketType,
  ) {
    super({ run: 'async', maxQuantity: 5, period: 1 }); // spot request limit ratio 20/s

    // Donem temps pq el controlador es pugui instanciar i establir les subscripcions amb l'exchange.
    // setTimeout(() => this.retrieveExchangeInfo(), 100);
    this.retrieveExchangeInfo();
  }
  

  abstract initialize(): Promise<void>;


  // ---------------------------------------------------------------------------------------------------
  //  Exchange info
  // ---------------------------------------------------------------------------------------------------

  async retrieveExchangeInfo() {
    console.log(this.constructor.name + '.retrieveExchangeInfo()');
    this.marketApi.getExchangeInfo().then(response => {
      this.processExchangeLimits(response.limits);
      this.isReady = true;
      this.exchangeInfoUpdated.next();
    }).catch(error => {
      console.error('getExchangeInfo error: ', error);
    });
  }

  protected processExchangeLimits(rateLimits: Limit[]): void {
    // Cerquem els límits amb la proporció més baixa.
    const findLimit = (rateLimitType: LimitType, limits: Limit[]): Limit => {
      return limits
        .filter(l => l.type === rateLimitType && moment.duration(1, l.unitOfTime).asSeconds() <= 60)
        .reduce((prev: Limit, cur: Limit) => (!prev || (cur.maxQuantity / cur.period < prev.maxQuantity / prev.period)) ? cur : prev)
    };
    // Comprovem si han canviat.
    const limitChanged = (limitA: Limit, limitB: Limit): boolean => !limitA || !limitB || limitA.maxQuantity !== limitB.maxQuantity || limitA.period !== limitB.period;
    // Obtenim els límits d'exchange i de compte.
    const requests = findLimit('request', rateLimits);
    const orders = findLimit('trade', rateLimits);
    if (requests && limitChanged(this.limitRequest, requests)) {
      this.limitRequest = requests;
      // Actualitzem el nou límit de requests que gestiona aquest executor.
      this.updateLimit(requests);
    }
    if (orders && limitChanged(this.limitOrders, orders)) {
      this.limitOrders = orders;
      // Notifiquem el nou límit d'ordres que correspon actualitzar a cada controlador.
      this.ordersLimitsChanged.next(orders);
    }
  }


  // ---------------------------------------------------------------------------------------------------
  //  market
  // ---------------------------------------------------------------------------------------------------

  getMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice> {
    const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
    if (this.marketPriceSubjects[symbolKey]) {
      return this.marketPriceSubjects[symbolKey];
    } else {
      return this.createMarketPriceSubject(symbol);
    }
  }
  
  protected createMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice> {
    const subject = new Subject<MarketPrice>();
    const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
    this.marketPriceSubjects[symbolKey] = subject;
    this.marketWs.priceTicker(symbol).subscribe(data => subject.next(data));
    return subject;
  }

  async getMarketPrice(symbol: SymbolType): Promise<MarketPrice> {
    this.countPeriod++;
    return this.marketApi.getPriceTicker(symbol);
  }

  getMarketKlineSubject(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline> {
    const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
    if (this.marketKlineSubjects[`${symbolKey}_${interval}`]) {
      return this.marketKlineSubjects[`${symbolKey}_${interval}`];
    } else {
      return this.createMarketKlineSubject(symbol, interval);
    }
  }

  protected createMarketKlineSubject(symbol: SymbolType, interval: KlineIntervalType): Subject<MarketKline> {
    const subject = new Subject<MarketKline>();
    const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
    this.marketKlineSubjects[`${symbolKey}_${interval}`] = subject;
    this.marketWs.klineTicker(symbol, interval).subscribe(data => subject.next(data));
    return subject;
  }

  getMarketSymbol(symbol: SymbolType): Promise<MarketSymbol> {
    return this.marketApi.getMarketSymbol(symbol);
  }


  // ---------------------------------------------------------------------------------------------------
  //  account
  // ---------------------------------------------------------------------------------------------------

  protected abstract createAccountWebsocket(account: ExchangeAccount): ExchangeWebsocket;

  protected getAccountWebsocket(account: ExchangeAccount): ExchangeWebsocket {
    const accountId = `${account.idUser}`;
    const stored = this.accountWs[accountId];
    if (stored) { return stored; }
    const created = this.createAccountWebsocket(account);
    this.accountWs[accountId] = created;
    return created;
  }

  getAccountEventsSubject(account: ExchangeAccount, symbol?: SymbolType): Subject<AccountEvent> {
    const accountId = `${account.idUser}`;
    if (this.accountEventsSubjects[accountId]) {
      return this.accountEventsSubjects[accountId];
    } else {
      return this.createAccountEventsSubject(account, symbol);
    }
  }

  protected createAccountEventsSubject(account: ExchangeAccount, symbol?: SymbolType): Subject<AccountEvent> {
    const ws = this.getAccountWebsocket(account);
    const subject = new Subject<AccountEvent>();
    const accountId = `${account.idUser}`;
    this.accountEventsSubjects[accountId] = subject;
    // Recuperem la info del compte per veure si està disponible.
    this.retrieveAcountInfo(account).then(ready => subject.next({ type: 'accountReady', ready } as AccountReadyStatus));
    // Ens suscribim a les notificacions de balaços.
    ws.accountUpdate().subscribe(balance => this.onAccountUpdate(account, balance));
    // Ens suscribim a les notificacions d'ordres.
    ws.orderUpdate().subscribe(order => this.onOrderUpdate(account, order));
    return subject;
  }
  
  async retrieveAcountInfo(account: ExchangeAccount): Promise<boolean> {
    console.log(this.constructor.name + '.retrieveAcountInfo()');
    const { api } = this.getAccountWebsocket(account);
    const info = await api.getAccountInfo(); // .catch(error => console.error(error));
    const canTrade = !!info?.canTrade;
    if (!canTrade) { throw { message: `No es pot fer trading amb el compte '${account.idUser}' al mercat '${this.market}'.` }; }
    this.processInitialBalances(account, info.balances);
    const balances = account.markets[this.market].balances;
    const balanceReady = !!Object.keys(balances).length;
    if (!balanceReady) { throw { message: `Error recuperant els balanços del compte '${account.idUser}' al mercat '${this.market}'.` }; }
    return Promise.resolve(balanceReady && canTrade);
  }

  protected processInitialBalances(account: ExchangeAccount, coins: Balance[]): void {
    coins.forEach(balance => {
      const coin = balance.asset;
      const balances = account.markets[this.market].balances;
      // NOTA: Podria haver-se establert un preu més recent des del websocket (el respectem).
      if (!balances[coin]) { balances[coin] = balance; };
    });
  }

  protected onAccountUpdate(account: ExchangeAccount, update: WsAccountUpdate) {
    const { market } = this;
    const accountId = `${account.idUser}`;
    const accountMarket = account.markets[this.market];
    const balances: Balance[] = [];
    // Actualitzem els balanços de cada asset.
    if (this.market === 'spot') {
      update.balances?.map(balance => {
        // NOTA: Recordem si NO ens ha arribat la info del balance bloquejat per calcular-lo més tard al rebre l'ordre manualment.
        this.balanceLocketIsMissing = balance.locked === undefined;
        if (balance.balance !== undefined) { accountMarket.balances[balance.asset].balance = balance.balance; }
        if (balance.available !== undefined) { accountMarket.balances[balance.asset].available = balance.available; }
        if (balance.locked !== undefined) { accountMarket.balances[balance.asset].locked = balance.locked; }
        balances.push(accountMarket.balances[balance.asset]);
      });
    } else {
      // Actualitzem el preu promig de cada posició/symbol.
      update.positions?.map(position => {
        const symbolKey = `${position.symbol.baseAsset}_${position.symbol.quoteAsset}`;
        accountMarket.averagePrices[symbolKey] = position.price;
      });
      // Actualitzem els balanços de cada asset.
      update.balances?.map(balance => {
        accountMarket.balances[balance.asset].balance = balance.balance;
        balances.push(accountMarket.balances[balance.asset]);
      });
    }
    // Notifiquem els balanços actualitzats.
    this.accountEventsSubjects[accountId].next({ type: 'accountUpdate', market, balances });
  }


  // ---------------------------------------------------------------------------------------------------
  //  orders tasks
  // ---------------------------------------------------------------------------------------------------
  
  do(task: OrderTask) { super.do(task); }

  getOrder(task: OrderTask): void { this.do(task); }

  postOrder(task: OrderTask): void { this.do(task); }

  cancelOrder(task: OrderTask): void { this.do(task); }

  protected executeTask(task: OrderTask): Promise<any> {
    // logTime(`exec task ${task.type} ${task.data.order.id}`);
    switch (task.type) {
      case 'getOrder': this.getOrderTask(task); break;
      case 'postOrder': this.postOrderTask(task); break;
      case 'cancelOrder': this.cancelOrderTask(task); break;
      default:
        throw { code: 500, message: `No s'ha implementat la tasca de tipus '${task.type}'.` };
    }
    // NOTA: La promise només és necessària per a una execució seqüencial (sync) i estem en un paradigma async.
    return Promise.resolve();
  }

  
  protected async getOrderTask(task: OrderTask) {
    const { account } = task.data as { account: ExchangeAccount; };
    const { api } = this.getAccountWebsocket(account);
    const { symbol, id, exchangeId, type } = Object.assign({}, task.data.order);    
    api.getOrder({ symbol, id, exchangeId, type }).then(order => {
      const { accountId, strategyId } = splitOrderId(order.id);
      const controllerId = `${accountId}-${strategyId}`;
      // Guardem l'ordre sol·licitada al mercat de l'exchange.
      account.markets[this.market].orders.push(order as Order);
      // Notifiquem l'ordre obtinguda al controlador pq comprovi si pot iniciar l'activitat.
      this.ordersEventsSubjects[controllerId].next(order as Order);
    });
  }

  protected postOrderTask(task: OrderTask) {
    const { account } = task.data;
    const { api } = this.getAccountWebsocket(account);
    const copy: Order = Object.assign({}, task.data.order);
    account.markets[this.market].orders.push(copy);
    const order: PostOrderRequest = {
      side: copy.side,
      symbol: copy.symbol,
      type: copy.type,
      // timeInForce: 'GTC',
      price: copy.price,
      quantity: copy.baseQuantity,
      id: copy.id,
    };
    // // if (copy.type === 'stop' || copy.type === 'stop_market') { order.stopPrice = copy.stopPrice; }
    // if (market === 'futures' && copy.type === 'stop_market') { order.closePosition = true; }
    return api.postOrder(order as any);
  }

  protected cancelOrderTask(task: OrderTask) {
    const { account, order } = task.data as { account: ExchangeAccount; order: Order; };
    const { api } = this.getAccountWebsocket(account);
    const found: Order = account.markets[this.market].orders.find(o => o.id === order.id);
    if (found) { found.status = 'cancel'; }
    return api.cancelOrder({
      symbol: order.symbol,
      exchangeId: order.exchangeId,
      id: order.id,
      type: order.type,
    });
  }


  // ---------------------------------------------------------------------------------------------------
  //  orders events
  // ---------------------------------------------------------------------------------------------------

  getOrdersEventsSubject(account: ExchangeAccount, controllerId: string): Subject<Order> {
    if (this.ordersEventsSubjects[controllerId]) {
      return this.ordersEventsSubjects[controllerId];
    } else {
      const subject = new Subject<Order>();
      this.ordersEventsSubjects[controllerId] = subject;
      return subject;
    }
  }

  protected onOrderUpdate(account: ExchangeAccount, eventOrder: Order) {
    const { name, market } = this;
    switch (eventOrder.status) {
      case 'new': case 'filled': case 'partial': case 'canceled': case 'expired': case 'rejected':
        const { accountId, strategyId } = splitOrderId(eventOrder.id);
        const controllerId = `${accountId}-${strategyId}`;
        const order = account.markets[this.market].orders.find(o => o.id === eventOrder.id);
        // Ignorem les ordres que no estiguin registrades al market.
        if (!order) { return; }
        // Actualitzem l'ordre respectant la mateixa instància que pot estar referènciada des de PartialOrder.
        Object.assign(order, eventOrder);
        if (eventOrder.status === 'partial') {
          // Si es tracta d'una 'PARTIALLY_FILLED', comprovar si s'ha d'engegar un timer o, si ja existeix, seguir acumulant i reiniciant el timer.
          this.processPartialFilled(account, order);
    
        } else {
          if (eventOrder.status === 'filled') { this.completePartialFilled(account, order); }
          // TODO: eliminar les ordres executades del account market.
          this.ordersEventsSubjects[controllerId].next(order);
        }
        if (this.balanceLocketIsMissing) {
          // TODO: Ara que ja s'han actualitzat l'estat de les ordres, calculem la quantitat bloquejada del balance del compte.
          // Obtenim el locked.
          // Calculem el balance = available + locked.
        }
        break;
      // case 'cancelling': case 'pending_cancel': // case 'trade':
      //   break;
      default:
        const orderId = (order as any).originalClientOrderId || (order as any).clientOrderId;
        throw { message: `No s'ha implementat l'estat '${order.status}' d'ordre ${orderId} de Binance` };
    }
  }

  protected processPartialFilled(account: ExchangeAccount, order: Order) {
    if (!this.partials[order.id]) {
      this.partials[order.id] = { order, count: 0, accumulated: order.baseQuantity, subscription: undefined } as PartialOrder;
    }
    const partial = this.partials[order.id];
    if (partial.subscription) { partial.subscription.unsubscribe(); }
    partial.subscription = timer(this.partialPeriod).subscribe(() => this.notifyUnsatisfiedPartialOrder(account, partial));
    partial.accumulated += order.baseQuantity;
    partial.avgPrice = (partial.avgPrice * partial.accumulated + order.price * order.baseQuantity) / (partial.accumulated + order.baseQuantity);
    partial.count += 1;
  }

  protected completePartialFilled(account: ExchangeAccount, order: Order) {
    const stored = this.partials[order.id];
    if (!stored) { return; }
    // Aturem el timer.
    if (stored.subscription) { stored.subscription.unsubscribe(); }
    // Eliminem la info de PartialOrder.
    delete this.partials[order.id];
  }

  protected notifyUnsatisfiedPartialOrder(account: ExchangeAccount, partial: PartialOrder) {
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
    order.quoteQuantity = this.fixQuote(partial.accumulated * partial.avgPrice, order.symbol);
    order.price = partial.avgPrice;

    // Eliminem la info de PartialOrder.
    delete this.partials[order.id];
    // Notifiquem el resultat.
    this.ordersEventsSubjects[controllerId].next(order);
  }


  // ---------------------------------------------------------------------------------------------------
  //  helpers
  // ---------------------------------------------------------------------------------------------------  

  protected isExecutedStatus(status: ResultOrderStatus): boolean { return status === 'new' || status === 'expired'; }

  findMarketSymbol(symbol: SymbolType): any {
    return this.symbols.find(s => s.symbol.baseAsset === symbol.baseAsset && s.symbol.quoteAsset === symbol.quoteAsset);
  }

  fixBase(base: number, symbol: SymbolType) {
    const found = this.findMarketSymbol(symbol);
    return +base.toFixed(found.basePrecision);
  }

  fixQuote(quote: number, symbol: SymbolType) {
    const found = this.findMarketSymbol(symbol);
    return +quote.toFixed(found.quotePrecision);
  }

}
