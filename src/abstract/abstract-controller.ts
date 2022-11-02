
import { ExchangeAccount } from "./exchange-account";
import { Exchange } from "./abstract-exchange";
import { splitOrderId, timestamp } from "./shared";
import { AccountEvent, AccountMarket, AccountReadyStatus, Balance, SymbolType, CoinType, InstanceController, MarketSymbol, MarketType, Order, OrderSide, OrderStatus, OrderTask, OrderType, SimulationData, Strategy } from "./types";


export type ControllerStatus = 'on' | 'paused' | 'off';

export abstract class AbstractController {

  /** Referència a les instàncies de l'estragègia del controlador. */
  instances: InstanceController[] = [];
  /** Balanços globals del controlador */
  balances: { [key: string]: Balance; };
  /** Informació del símbol de l'exchange actual. */
  marketSymbol: MarketSymbol;
  /** Indica si el mercat està disponible. */
  exchangeReady = false;
  /** Indica si la info del compte (permisos compte, permisos api, balances, ordres) està disponible. */
  accountReady = false;
  /** Indica que s'han carregat les dades de les instàncies. */
  instancesReady = false;
  /** Indica si les ordres que faltaven al marquet ja han sigut sol·licitades a través de getOrders. */
  ordersRequested = false;
  /** Indica que totes les ordres de les instàncies estan al mirror. */
  ordersReady = false;
  /** Indica l'estat d'execució del controlador. */
  status: ControllerStatus = 'off';
  /** Numerador d'instàncies. NOTA: Quan s'elimini l'última instància, restablim el contador a zero. */
  lastInstanceId = 0;
  /** Log de la simulació */
  simulation: SimulationData[] = [];
  // /** Log de l'activitat del controlador. */
  // logger: Logger;


  constructor(
    public account: ExchangeAccount,
    public strategy: Strategy,
    public exchange: Exchange,
    public options: { [key: string]: any },
  ) {
    // Creem uns balanços a zero per al controlador. Els inicialitzará la classe heredada.
    this.balances = this.createBalances();
    // Carreguem les instàncies.
    this.loadInstances();
    // Ens subscribim a les notificacions de l'exchange.
    this.subscribeToExchangeEvents();
    // Obtenim la info de l'exchange.
    this.initializeExchangeInfo();
    // Inicialitzem la simulació.
    if (this.simulated) { this.initSimulation(); }
    // // Instanciem un logger.
    // this.logger = new FileLogger(`data/${account.folder}/log/strategy-${strategy.idreg}`, 'daily');
  }
  

  // ---------------------------------------------------------------------------------------------------
  //  exchange events
  // ---------------------------------------------------------------------------------------------------

  protected subscribeToExchangeEvents(): void {
    console.log('BaseController.subscribeToExchangeEvents()');
    const { account, exchange, controllerId, accountMarket, symbol } = this;
    // // Obtenim la info dels límits per account/market.
    // accountMarket.executor.ordersLimitsChanged.subscribe(limit => this.start());
    // // Obtenim la info de l'exchange per comprovar que existeix el símbol de l'estratègia i està operatiu.
    // exchange.symbolsInitialized.subscribe(info => this.checkSymbol(info));
    // exchange.marketSymbolStatusChanged.subscribe(status => this.updateMarketStatus(status));
    exchange.exchangeInfoUpdated.subscribe(() => this.initializeExchangeInfo());
    // Solicitem un canal de comunicació per la info que ens arribi del compte de l'usuari.
    exchange.getAccountEventsSubject(account, symbol).subscribe(data => this.processAccountEvents(data));
    // Solicitem un canal de comunicació exclusiu pel controlador per rebre la info d'execució de les ordres.
    exchange.getOrdersEventsSubject(account, controllerId).subscribe(data => this.processOrdersEvents(data));
  }


  // ---------------------------------------------------------------------------------------------------
  //  instances files
  // ---------------------------------------------------------------------------------------------------

  protected abstract loadInstances(): Promise<InstanceController[]>;

  protected abstract saveInstance(instance: InstanceController): void;

  protected abstract deleteInstance(instance: InstanceController): void;


  // ---------------------------------------------------------------------------------------------------
  //  simulation
  // ---------------------------------------------------------------------------------------------------

  protected initSimulation() {
    const { quoteAsset, baseAsset } = this;
    const data = this.strategy.simulatorDataSource;
    if (!data) { throw ({ message: `No s'han inicialitzat les dades del simulador a l'estratègia ('simulatorDataSource').` }); }
    // Inicialitzem els balances.
    this.accountMarket.balances[quoteAsset] = {
      asset: quoteAsset,
      balance: data.quoteQuantity,
      available: data.quoteQuantity,
      locked: 0.0,
      remainder: 0.0,
      fee: 0.0,
    };
    if (data.baseQuantity) {
      this.accountMarket.balances[baseAsset] = {
        asset: baseAsset,
        balance: data.baseQuantity,
        available: data.baseQuantity,
        locked: 0.0,
        remainder: 0.0,
        fee: 0.0,
      };
    }
  }


  // ---------------------------------------------------------------------------------------------------
  //  Status
  // ---------------------------------------------------------------------------------------------------

  get on(): boolean { return this.status === 'on'; }

  get off(): boolean { return this.status === 'off'; }

  get paused(): boolean { return this.status === 'paused'; }

  get readyToStart(): boolean { return this.exchangeReady && this.accountReady && this.instancesReady; }


  // ---------------------------------------------------------------------------------------------------
  //  Strategy
  // ---------------------------------------------------------------------------------------------------

  get market(): MarketType { return this.strategy?.market; }

  get symbol(): SymbolType { return this.strategy?.symbol; }

  get quoteAsset(): CoinType { return this.strategy?.symbol.quoteAsset; }

  get baseAsset(): CoinType { return this.strategy?.symbol.baseAsset; }
  
  get leverage(): number { return this.strategy?.params.leverage; }


  // ---------------------------------------------------------------------------------------------------
  //  Ids
  // ---------------------------------------------------------------------------------------------------

  get accountId(): string { return `${this.account?.idUser}` }

  get strategyId(): string { return `${this.strategy?.idreg}` }

  get controllerId(): string { return `${this.account.idUser}-${this.strategy.idreg}` }


  // ---------------------------------------------------------------------------------------------------
  //  market
  // ---------------------------------------------------------------------------------------------------

  get accountMarket(): AccountMarket { return this.account.markets[this.market]; }

  // get limitsReady(): boolean { return this.accountMarket.executor.limitsReady; }


  // ---------------------------------------------------------------------------------------------------
  //  exchange
  // ---------------------------------------------------------------------------------------------------

  // get marketSymbol(): MarketSymbol { return this.exchange.getMarketSymbol(symbol); }

  fixPrice(price: number) { return +price.toFixed(this.marketSymbol.pricePrecision || 3); }

  fixQuantity(quantity: number) { return +quantity.toFixed(this.marketSymbol.quantityPrecision || 2); }

  fixBase(base: number) { return +base.toFixed(this.marketSymbol.basePrecision); }

  fixQuote(quote: number) { return +quote.toFixed(this.marketSymbol.quotePrecision); }

  floorQuantity(quantity: number) {
    const decimals = this.marketSymbol.quantityPrecision || 2;
    return (Math.floor(quantity * Math.pow(10, decimals)) / Math.pow(10, decimals));
  }


  // ---------------------------------------------------------------------------------------------------
  //  simulation
  // ---------------------------------------------------------------------------------------------------

  get simulated(): boolean { return this.strategy?.exchange === 'simulator'; }

  get simulator(): Exchange { return this.exchange as Exchange; }

  set simulate(data: SimulationData) { if (this.simulated) { this.simulation.push(data); }; }

  // protected tickPrice() { if (this.simulated) { this.simulator.tickPrice(); } }

  // protected tickKline() { if (this.simulated) { this.simulator.tickKline(); } }


  // ---------------------------------------------------------------------------------------------------
  //  Instaces
  // ---------------------------------------------------------------------------------------------------

  protected createInstance(): InstanceController {
    const instance: InstanceController = {
      id: ++this.lastInstanceId,
      created: timestamp(),
      updated: timestamp(),
      lastOrderId: 0,
      orders: [],
      balances: this.createBalances(),
    };
    return instance;
  }

  protected createBalances() {
    const { baseAsset, quoteAsset } = this;
    return {
      [quoteAsset]: {
        asset: quoteAsset,
        balance: 0.0,
        available: 0.0,
        locked: 0.0,
        remainder: 0.0,
        fee: 0.0,
      },
      [baseAsset]: {
        asset: baseAsset,
        balance: 0.0,
        available: 0.0,
        locked: 0.0,
        remainder: 0.0,
        fee: 0.0,
      },
    };
  }

  protected getInstanceByOrderId(id: string): InstanceController {
    const { instanceId } = splitOrderId(id);
    return this.instances.find(i => i.id === instanceId);
  }


  // ---------------------------------------------------------------------------------------------------
  //  lifecycle
  // ---------------------------------------------------------------------------------------------------

  start(): boolean {
    // instancies <-> ordres
    if (!this.readyToStart) { return false; }
    console.log(this.constructor.name + ' -> start()');
    return this.resume();
  }

  pause(): void {
    this.status = 'paused';
  }

  resume(): boolean {
    const { market, exchange, params } = this.strategy;
    // instancies <-> ordres
    if (!this.checkOrders()) { return false; }
    // Actualitzem l'estat del controlador.
    this.status = 'on';
    console.log(this.constructor.name + ' -> resume()');
    return true;
  }

  stop(): void {
    console.log(this.constructor.name + ' -> stop()');
    this.status = 'off';
  }

  abort(): void {
    console.log(this.constructor.name + ' -> abort()');
    this.status = 'off';
  }

  protected checkOrders(): boolean {
    // Comprovem que les ordres de les instàncies estiguin al mirror de l'exchange.
    const missing: Order[] = this.instances.reduce((prev: Order[], instance: InstanceController) => {
      prev.push(...instance.orders.reduce((p: Order[], o: Order) => {
        if (!this.accountMarket.orders.find(m => m.id === o.id)) { p.push(o); }
        return p;
      }, []));
      return prev;
    }, []);
    // Mentre faltin ordres, no estara a punt.
    this.ordersReady = !missing.length;
    // Sol·licitem a l'exchange les orders que falten.
    if (missing.length && !this.ordersRequested) {
      this.ordersRequested = true;
      missing.map(o => this.getOrder(o));
    }
    return this.ordersReady;
  }


  // ---------------------------------------------------------------------------------------------------
  //  orders
  // ---------------------------------------------------------------------------------------------------

  /** Envia les ordres a l'executor d'ordres assignat a l'account/market compartit per tots els controladors. */
  private do(task: OrderTask) { this.accountMarket.executor.do(task); }

  protected getOrder(order: Order) {
    const { account, controllerId } = this;
    this.do({ type: 'getOrder', data: { account, controllerId, order } });
  }

  protected createOrderBuyMarket(instance: InstanceController, baseQuantity: number, price?: number) {
    const { account, controllerId } = this;
    const order: Order = this.createOrder(instance, 'buy', 'market', baseQuantity, { price });
    this.do({ type: 'postOrder', data: { account, controllerId, order } });
  }

  protected createOrderSellMarket(instance: InstanceController, baseQuantity: number, price?: number, idOrderBuyed?: string) {
    const { account, controllerId } = this;
    const order: Order = this.createOrder(instance, 'sell', 'market', baseQuantity, { price, idOrderBuyed });
    this.do({ type: 'postOrder', data: { account, controllerId, order } });
  }

  // protected createOrderSellStopMarket(instance: InstanceController, baseQuantity: number, price?: number, idOrderBuyed?: string) {
  //   const { account, controllerId } = this;
  //   const order: Order = this.createOrder(instance, 'sell', 'stop_market', baseQuantity, { price, idOrderBuyed });
  //   this.do({ type: 'postOrder', data: { account, controllerId, order } });
  // }

  protected createOrderBuyLimit(instance: InstanceController, baseQuantity: number, price: number) {
    const { account, controllerId } = this;
    const order: Order = this.createOrder(instance, 'buy', 'limit', baseQuantity, { price });
    this.do({ type: 'postOrder', data: { account, controllerId, order } });
  }

  protected createOrderSellLimit(instance: InstanceController, baseQuantity: number, price: number, idOrderBuyed?: string) {
    const { account, controllerId } = this;
    const order: Order = this.createOrder(instance, 'sell', 'limit', baseQuantity, { price, idOrderBuyed });
    this.do({ type: 'postOrder', data: { account, controllerId, order } });
  }

  // protected createOrderBuyOco(instance: InstanceController, baseQuantityA: number, baseQuantityB: number, priceA: number, priceB: number) {
  //   const { account, controllerId } = this;
  //   const orderA: Order = this.createOrder(instance, 'buy', this.market === 'spot' ? 'stop_loss_limit' : 'stop_market', baseQuantityA, { price: priceA, stopPrice: priceA });
  //   const orderB: Order = this.createOrder(instance, 'buy', this.market === 'spot' ? 'limit' : 'stop_market', baseQuantityB, { price: priceB, stopPrice: priceB });
  //   orderA.id = `${orderA.id}-A`;
  //   orderB.id = `${orderB.id}-B`;
  //   orderA.isOco = true;
  //   orderB.isOco = true;
  //   this.do({ type: 'postOrder', data: { account, controllerId, order: orderA } });
  //   this.do({ type: 'postOrder', data: { account, controllerId, order: orderB } });
  // }

  protected cancelOrder(instance: InstanceController, order: Order) {
    const { account, controllerId } = this;
    
    this.do({ type: 'cancelOrder', data: { account, controllerId, order } });
  }

  protected createOrder(instance: InstanceController, side: OrderSide, type: OrderType, baseQuantity: number, options: { price?: number; stopPrice?: number; status?: OrderStatus, idOrderBuyed?: string }) {
    const { symbol } = this;
    let { price, status, idOrderBuyed } = options;
    if (status === undefined) { status = 'post'; }
    if (price) { price = this.fixPrice(price); }
    if (baseQuantity) { baseQuantity = this.adjustQuantity(instance, baseQuantity); }
    const order: Order = {
      id: this.generateOrderId(instance),
      exchangeId: undefined,
      symbol,
      side,
      type,
      status,
      baseQuantity,
      price,
      isOco: false,
      created: timestamp(),
    }

    if (idOrderBuyed !== undefined) { order.idOrderBuyed = idOrderBuyed; }

    instance.orders.push(order);
    // console.log('>> ', [ instance.id, order.id, order.side + ' ' + order.type, order.baseQuantity, order.quoteQuantity, order.price, order.status ]);
    return order;
  }

  private adjustQuantity(instance: InstanceController, baseQuantity: number): number {
    const { baseAsset } = this;
    const marketBalances = this.accountMarket.balances;
    // Arrodonim per abaix la quantitat. Per evitar acabar posant una ordre amb una quantitat que no disposem.
    const adjusted = this.floorQuantity(baseQuantity);
    // Registrem aquest remanent.
    const remainder = baseQuantity - adjusted;
    if (remainder > 0) {
      instance.balances[baseAsset].remainder = this.fixBase(instance.balances[baseAsset].remainder + remainder);
      this.balances[baseAsset].remainder = this.fixBase(this.balances[baseAsset].remainder + remainder);
      marketBalances[baseAsset].remainder = this.fixBase(marketBalances[baseAsset].remainder + remainder);
    }
    return adjusted;
  }

  protected cancelInstanceOrders(instance: InstanceController) {
    // console.log('CANCEL', instance.orders.length);
    const orders = instance.orders.map(o => o);
    orders.map(order => {
      order.status === 'cancel';
      this.cancelOrder(instance, order);
    });
  }


  // ---------------------------------------------------------------------------------------------------
  //  Exchange callbacks
  // ---------------------------------------------------------------------------------------------------

  protected async initializeExchangeInfo(): Promise<void> {
    const { symbol } = this;
    if (!this.exchange.isReady) { return; }
    this.marketSymbol = await this.exchange.getMarketSymbol(symbol);
    const ready = this.marketSymbol.ready;
    if (this.exchangeReady !== ready) {
      this.exchangeReady = ready;
      if (this.off) {
        this.start();
      } else {
        if (this.on && !ready) {
          this.pause();
        } else if (this.paused && ready) {
          this.resume();
        }
      }
    }
  }

  protected processAccountEvents(event: AccountEvent): void {
    if (!event) { return; }
    switch (event.type) {
      case 'accountReady':
        console.log('processAccountEvents -> accountReady', event);
        const status = event as AccountReadyStatus;
        if (status.ready) {
          this.accountReady = true;
          if (this.off) { this.start(); }
        }
        break;
      case 'accountUpdate':
        break;
    }
  }

  protected processOrdersEvents(eventOrder: Order): boolean {
    if (!eventOrder) { return false; }
    // console.log('Result', order);
    if (!this.ordersReady || !this.on) { console.log('processOrdersEvents', { ordersReady: this.ordersReady, status: this.status }); }
    // Si no estava en marxa, el posem en marxa ara.
    if (!this.ordersReady && !this.on) { this.resume(); return false; }
    // Actualitzem el balance de la instància afectada.
    this.processBalanceOrderUpdate(eventOrder);
    // Actualitzem l'ordre.
    const instance = this.getInstanceByOrderId(eventOrder.id);
    const order = instance.orders.find(o => o.id === eventOrder.id);
    if (order === undefined || eventOrder === undefined) { console.log('UNDEFINED!!!!!!!!', order, eventOrder); }
    Object.assign(order, eventOrder);
    // Indiquem a la classe heredada que pot procedir.
    return true;
  }

  protected processBalanceOrderUpdate(eventOrder: Order) {
    const instance = this.getInstanceByOrderId(eventOrder.id);
    const { id } = eventOrder;
    // Obtenim l'ordre original, pq el preu ha variat.
    const oldOrder = instance.orders.find(o => o.id === id);
    this.updateBalances(eventOrder, oldOrder, instance.balances[this.baseAsset], instance.balances[this.quoteAsset]);
    this.updateBalances(eventOrder, oldOrder, this.balances[this.baseAsset], this.balances[this.quoteAsset]);
  }

  protected updateBalances(eventOrder: Order, oldOrder: Order, base: Balance, quote: Balance) {
    const { id, side, status, type, baseQuantity, quoteQuantity, price, profit } = eventOrder;
    const { commission, commissionAsset } = eventOrder;
    const { quoteAsset, baseAsset, leverage } = this;
    switch (status) {
      case 'new':
        if (side === 'buy') {
          // balance = available + locked
          // Ex: 100 = 90 + 10
          quote.locked = this.fixQuote(quote.locked + this.fixQuote(baseQuantity * price));
          quote.available = this.fixQuote(quote.available - this.fixQuote(baseQuantity * price));
        } else {
          base.locked = this.fixBase(base.locked + baseQuantity);
          base.available = this.fixBase(base.available - baseQuantity);
        }
        break;
      case 'canceled':
      case 'expired':
      case 'rejected':
        if (side === 'buy') {
          quote.locked = this.fixQuote(quote.locked - this.fixQuote(baseQuantity * price));
          quote.available = this.fixQuote(quote.available + this.fixQuote(baseQuantity * price));
        } else {
          base.locked = this.fixBase(base.locked - baseQuantity);
          base.available = this.fixBase(base.available + baseQuantity);
        }
        break;
      case 'filled':
      case 'unsatisfied':
        // Desfem les previsions teòriques.
        if (side === 'buy') {
          // Ex: 100 = 100 + 0
          // if (oldOrder.baseQuantity === undefined) { console.log(oldOrder); }
          quote.locked = this.fixQuote(quote.locked - this.fixQuote(oldOrder.baseQuantity * oldOrder.price));
          quote.available = this.fixQuote(quote.available + (oldOrder.baseQuantity * price));
        } else {
          base.locked = this.fixBase(base.locked - oldOrder.baseQuantity);
          base.available = this.fixBase(base.available + oldOrder.baseQuantity);
        }
        // Restem les comisions.
        const quoteCommission = commissionAsset === quoteAsset ? this.fixQuote(commission) : 0.0;
        const baseCommission = commissionAsset === baseAsset ? this.fixBase(commission) : 0.0;
        quote.balance = this.fixQuote(quote.balance - quoteCommission);
        base.balance = this.fixBase(base.balance - baseCommission);
        // Actualitzem el balanç real.
        if (this.market === 'spot') {
          if (side === 'buy') {
            // Ex: 91 = 91 + 0
            quote.balance = this.fixQuote(quote.balance - quoteQuantity);
            quote.available = this.fixQuote(quote.available - quoteQuantity);
            base.balance = this.fixBase(base.balance + baseQuantity);
            base.available = this.fixBase(base.available + baseQuantity);
          } else {
            quote.balance = this.fixQuote(quote.balance + quoteQuantity);
            quote.available = this.fixQuote(quote.available + quoteQuantity);
            base.balance = this.fixBase(base.balance - baseQuantity);
            base.available = this.fixBase(base.available - baseQuantity);
          }
        } else if (this.market === 'futures') {
          if (side === 'buy') {
            base.balance = this.fixBase(base.balance + baseQuantity);
            base.available = this.fixBase(base.available + baseQuantity);
          } else {
            base.balance = this.fixBase(base.balance - baseQuantity);
            base.available = this.fixBase(base.available - baseQuantity);
            // Afegim el profit de les vendes.
            quote.balance = this.fixQuote(quote.balance + profit);
          }
        }
        // Contabilitzem les comisions.
        quote.fee = this.fixQuote(quote.fee + quoteCommission);
        base.fee = this.fixBase(base.fee + baseCommission);
    }
  }


  // ---------------------------------------------------------------------------------------------------
  //  Pèrdues i guanys
  // ---------------------------------------------------------------------------------------------------

  latenteAndMargin(price: number): number {
    return this.fixQuote(this.instances.reduce((total, instance) => {
      const base = instance.balances[this.baseAsset];
      const symbolKey = `${this.symbol.baseAsset}_${this.symbol.quoteAsset}`;
      const averagePrice = this.accountMarket.averagePrices[symbolKey];
      const latente = (price - averagePrice) * base.balance;
      const margin = -(price * base.balance / this.leverage);
      total += latente + margin;
      return total;
    }, 0.0));
  }


  // ---------------------------------------------------------------------------------------------------
  //  helpers
  // ---------------------------------------------------------------------------------------------------

  protected generateOrderId(instance: InstanceController): string {
    return `${this.accountId}-${this.strategyId}-${instance.id}-${++instance.lastOrderId}`;
  }

  get availbleBalanceAsset(): Number { return this.accountMarket.balances[this.quoteAsset].available; }

}
