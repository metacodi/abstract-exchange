import { BehaviorSubject, Subject, timer } from "rxjs";

import { Limit, TaskExecutor } from "./task-executor";
import { ExchangeAccount } from "./exchange-account";
import { AccountEvent, AccountReadyStatus, Balance, SymbolType, CoinType, ExchangeType, KlineIntervalType, MarketKline, MarketPrice, MarketSymbol, MarketType } from "./types";
import { Order, OrderBookPrice, OrderTask, PartialOrder, ResultOrderStatus } from "./types";
import { splitOrderId } from "./shared";
import { ExchangeWebsocket } from "./exchange-websocket";
import { ExchangeApi } from "./exchange-api";
import { WsAccountUpdate } from "./exchange-websocket-types";
import { ExchangeInfo, PostOrderRequest } from "./exchange-api-types";


export class Exchange extends TaskExecutor {
  /** Nombre del exchange */
  name: ExchangeType;
  /** Referència a la instància de l'API. */
  api: ExchangeApi;
  /** Referència al websockets pel market stream. */
  marketWs: ExchangeWebsocket;
  /** Referencies als websockets de cada compte. */
  accountsWs: { [accounId: string]: ExchangeWebsocket } = {};
  /** Colección de símbolos del exchange. */
  symbols: MarketSymbol[] = [];
  /** Límite de request del exchange. */
  limitRequest: Limit;
  /** Límite de órdenes del exchange. */
  limitOrders: Limit;

  symbolsInitialized = new BehaviorSubject<SymbolType[]>(undefined);
  ordersLimitsChanged = new BehaviorSubject<Limit>(undefined);
  marketSymbolStatusChanged = new BehaviorSubject<MarketSymbol>(undefined);
  
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
    setTimeout(() => this.retrieveExchangeInfo(), 100);
  }


  // ---------------------------------------------------------------------------------------------------
  //  Api
  // ---------------------------------------------------------------------------------------------------

  getApiClient(account?: ExchangeAccount): ExchangeApi {
    if (!this.api) {
      switch (this.name) {
        case 'binance':
          // this.api = new BinanceApi({ market: this.market });
          break;
        case 'kucoin':
          // this.api = new KucoinApi({ market: this.market });
          break;
        case 'okx':
          // this.api = new OkxApi({ market: this.market });
          break;
      }  
    }
    if (!!account) { this.api.setCredentials(account.exchanges[this.name]); }
    return this.api;
  }


  // ---------------------------------------------------------------------------------------------------
  //  Exchange info
  // ---------------------------------------------------------------------------------------------------

  async retrieveExchangeInfo() {
    console.log(this.constructor.name + '.retrieveExchangeInfo()');
    const api = this.getApiClient();
    api.getExchangeInfo().then(response => {
      if (response?.symbols) { this.processExchangeSymbols(response.symbols); }
      if (response?.limits) { this.processExchangeLimits(response.limits); }
    }).catch(error => {
      console.error('getExchangeInfo error: ', error);
    });
  }

  protected processExchangeSymbols(exchangeSymbols: MarketSymbol[]): void {
    const firstTime = !this.symbols.length;
    for (const marketSymbol of exchangeSymbols) {
      const symbol = marketSymbol.symbol;
      if (symbol) {
        const found = this.findMarketSymbol(symbol);
        if (found) {
          const changed = found.ready !== marketSymbol.ready;
          found.ready = marketSymbol.ready;
          if (changed) { this.marketSymbolStatusChanged.next(found); }
        } else {
          this.symbols.push(marketSymbol);
          this.marketSymbolStatusChanged.next(marketSymbol);
        }
      }
    }
    if (firstTime) { this.symbolsInitialized.next(this.symbols.map(s => s.symbol)); }
  }

  protected processExchangeLimits(rateLimits: Limit[]): void {
    // // Cerquem els límits amb la proporció més baixa.
    // const findLimit = (rateLimitType: string, limits: BinanceRateLimiter[]): Limit => {
    //   return limits.map(l => this.parseBinanceRateLimit(l))
    //     .filter(l => l.type === rateLimitType && moment.duration(1, l.unitOfTime).asSeconds() <= 60)
    //     .reduce((prev: Limit, cur: Limit) => (!prev || (cur.maxQuantity / cur.period < prev.maxQuantity / prev.period)) ? cur : prev)
    // };
    // const requests = findLimit('REQUEST_WEIGHT', rateLimits);
    // const orders = findLimit('ORDERS', rateLimits);
    // // Comprovem si han canviat.
    // const limitChanged = (limitA: Limit, limitB: Limit): boolean => !limitA || !limitB || limitA.maxQuantity !== limitB.maxQuantity || limitA.period !== limitB.period;
    // if (requests && limitChanged(this.limitRequest, requests)) {
    //   this.limitRequest = requests;
    //   // Actualitzem el nou límit de requests que gestiona aquest executor.
    //   this.updateLimit(requests);
    // }
    // if (orders && limitChanged(this.limitOrders, orders)) {
    //   this.limitOrders = orders;
    //   // Notifiquem el nou límit d'ordres que correspon actualitzar a cada controlador.
    //   this.ordersLimitsChanged.next(orders);
    // }
  }


  // ---------------------------------------------------------------------------------------------------
  //  market
  // ---------------------------------------------------------------------------------------------------
  
  protected getMarketWebsocket(symbol?: SymbolType) {
    if (this.marketWs) { return this.marketWs; }
    switch (this.name) {
      case 'binance':
        // this.marketWs = new BinanceWebsocket({ streamType: 'market', market: this.market });
        break;
      case 'kucoin':
        // this.marketWs = new KucoinWebsocket({ streamType: 'market', market: this.market });
        break;
      case 'okx':
        // this.marketWs = new OkxWebsocket({ streamType: 'market', market: this.market });
        break;
    }
    return this.marketWs;
  }

  getMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice> {
    const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
    if (this.marketPriceSubjects[symbolKey]) {
      return this.marketPriceSubjects[symbolKey];
    } else {
      return this.createMarketPriceSubject(symbol);
    }
  }
  
  protected createMarketPriceSubject(symbol: SymbolType): Subject<MarketPrice> {
    const ws = this.getMarketWebsocket(symbol);
    const subject = new Subject<MarketPrice>();
    const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
    this.marketPriceSubjects[symbolKey] = subject;
    ws.priceTicker(symbol).subscribe(data => subject.next(data));
    return subject;
  }

  async getMarketPrice(symbol: SymbolType): Promise<MarketPrice> {
    this.countPeriod++;
    const api = this.getApiClient();
    return api.getPriceTicker(symbol);
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
    const ws = this.getMarketWebsocket(symbol);
    const subject = new Subject<MarketKline>();
    const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
    this.marketKlineSubjects[`${symbolKey}_${interval}`] = subject;
    ws.klineTicker(symbol, interval).subscribe(data => subject.next(data));
    return subject;
  }


  // ---------------------------------------------------------------------------------------------------
  //  account
  // ---------------------------------------------------------------------------------------------------

  protected getAccountWebsocket(account: ExchangeAccount): ExchangeWebsocket {
    const accountId = `${account.idreg}`;
    const stored = this.accountsWs[accountId];
    if (stored) { return stored; }
    const { apiKey, apiSecret } = account.exchanges[this.name];
    let created;
    switch (this.name) {
      case 'binance':
        // created = new BinanceWebsocket({
        //   streamType: 'user',
        //   streamFormat: 'stream',
        //   market: this.binanceMarket(this.market, symbol),
        //   apiKey, apiSecret,
        // });
        break;
      case 'kucoin':
        // created = new KucoinWebsocket({
        //   streamType: 'user',
        //   streamFormat: 'stream',
        //   market: this.binanceMarket(this.market, symbol),
        //   apiKey, apiSecret,
        // });
        break;
    }
    this.accountsWs[accountId] = created;
    return created;
  }

  getAccountEventsSubject(account: ExchangeAccount, symbol?: SymbolType): Subject<AccountEvent> {
    const accountId = `${account.idreg}`;
    if (this.accountEventsSubjects[accountId]) {
      return this.accountEventsSubjects[accountId];
    } else {
      return this.createAccountEventsSubject(account, symbol);
    }
  }

  protected createAccountEventsSubject(account: ExchangeAccount, symbol?: SymbolType): Subject<AccountEvent> {
    const ws = this.getAccountWebsocket(account);
    const subject = new Subject<AccountEvent>();
    const accountId = `${account.idreg}`;
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
    const api = this.getApiClient(account);
    // const perms = await api.getApiKeyPermissions(); // .catch(error => console.error(error));
    const info = await api.getAccountInfo(); // .catch(error => console.error(error));
    // const canTrade = !!info?.canTrade && !!perms?.ipRestrict && (this.market === 'spot' ? !!perms?.enableSpotAndMarginTrading : !!perms?.enableFutures);
    const canTrade = !!info?.canTrade;
    if (!canTrade) { throw ({ message: `No es pot fer trading amb el compte '${account.idreg}' al mercat '${this.market}'.` }); }
    const coins = await api.getBalances();
    this.processInitialBalances(account, coins);
    const balances = account.markets[this.market].balances;
    const balanceReady = !!Object.keys(balances).length;
    if (!balanceReady) { throw new Error(`Error recuperant els balanços del compte '${account.idreg}' al mercat '${this.market}'.`); }
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
    const accountId = `${account.idreg}`;
    const accountMarket = account.markets[this.market];
    const balances: Balance[] = [];
    // Actualitzem els balanços de cada asset.
    if (this.market === 'spot') {
      update.balances?.map(balance => {
        accountMarket.balances[balance.asset].balance = balance.free + balance.locked;
        accountMarket.balances[balance.asset].available = balance.free;
        accountMarket.balances[balance.asset].locked = balance.locked;
        balances.push(accountMarket.balances[balance.asset]);
      });
    } else {
      // Actualitzem el preu promig de cada posició/symbol.
      update.positions?.map(position => {
        const symbolKey = `${position.symbol.baseAsset}_${position.symbol.quoteAsset}`;
        accountMarket.averagePrices[symbolKey] = position.entryPrice;
      });
      // Actualitzem els balanços de cada asset.
      update.balances?.map(balance => {
        accountMarket.balances[balance.asset].balance = balance.free;
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
        throw new Error(`No s'ha implementat la tasca de tipus '${task.type}'.`);
    }
    // NOTA: La promise només és necessària per a una execució seqüencial (sync) i estem en un paradigma async.
    return Promise.resolve();
  }

  
  protected async getOrderTask(task: OrderTask) {
    const { account } = task.data as { account: ExchangeAccount; };
    const api = this.getApiClient();
    const { symbol, id } = Object.assign({}, task.data.order);    
    api.getOrder({ symbol, origClientOrderId: id }).then(order => {
      const { accountId, strategyId } = splitOrderId(order.id);
      const controllerId = `${accountId}-${strategyId}`;
      // Guardem l'ordre sol·licitada al mercat de l'exchange.
      account.markets[this.market].orders.push(order);
      // Notifiquem l'ordre obtinguda al controlador pq comprovi si pot iniciar l'activitat.
      this.ordersEventsSubjects[controllerId].next(order);
    });
  }

  protected postOrderTask(task: OrderTask) {
    const { account } = task.data;
    const { market } = this;
    const api = this.getApiClient();
    const copy: Order = Object.assign({}, task.data.order);
    account.markets[this.market].orders.push(copy);
    const order: PostOrderRequest = {
      side: copy.side,
      symbol: copy.symbol,
      type: copy.type,
      // timeInForce: 'GTC',
      price: copy.price,
      quantity: copy.baseQuantity,
      newClientOrderId: copy.id,
    };
    // if (copy.type === 'stop' || copy.type === 'stop_market') { order.stopPrice = copy.stopPrice; }
    if (market === 'futures' && copy.type === 'stop_market') { order.closePosition = true; }
    return api.postOrder(order as any);
  }

  protected cancelOrderTask(task: OrderTask) {
    const { account, order } = task.data as { account: ExchangeAccount; order: Order; };
    const api = this.getApiClient();
    const found: Order = account.markets[this.market].orders.find(o => o.id === order.id);
    if (found) { found.status = 'cancel'; }
    return api.cancelOrder({
      symbol: order.symbol,
      // orderId: order.exchangeId,
      origClientOrderId: order.id,
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
        break;
      // case 'cancelling': case 'pending_cancel': // case 'trade':
      //   break;
      default:
        const orderId = (order as any).originalClientOrderId || (order as any).clientOrderId;
        throw ({ message: `No s'ha implementat l'estat '${order.status}' d'ordre ${orderId} de Binance` });
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
