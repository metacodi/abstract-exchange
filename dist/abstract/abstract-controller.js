"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractController = void 0;
const node_utils_1 = require("@metacodi/node-utils");
const shared_1 = require("./shared");
class AbstractController {
    constructor(account, strategy, exchange) {
        this.account = account;
        this.strategy = strategy;
        this.exchange = exchange;
        this.instances = [];
        this.marketReady = false;
        this.accountReady = false;
        this.instancesReady = false;
        this.ordersRequested = false;
        this.ordersReady = false;
        this.status = 'off';
        this.lastInstanceId = 0;
        this.simulation = [];
        this.config = this.loadAppSettings();
        this.balances = this.createBalances();
        this.loadInstances();
        this.subscribeToExchangeEvents();
        if (this.simulated) {
            this.initSimulation();
        }
    }
    subscribeToExchangeEvents() {
        console.log('BaseController.subscribeToExchangeEvents()');
        const { account, strategy, exchange, controllerId, accountMarket } = this;
        accountMarket.executor.ordersLimitsChanged.subscribe(limit => this.start());
        exchange.symbolsInitialized.subscribe(info => this.checkSymbol(info));
        exchange.marketSymbolStatusChanged.subscribe(status => this.updateMarketStatus(status));
        exchange.getAccountEventsSubject(account, strategy.symbol).subscribe(data => this.processAccountEvents(data));
        exchange.getOrdersEventsSubject(account, controllerId).subscribe(data => this.processOrdersEvents(data));
    }
    initSimulation() {
        const { quoteAsset, baseAsset } = this.strategy;
        const data = this.strategy.simulatorDataSource;
        if (!data) {
            throw ({ message: `No s'han inicialitzat les dades del simulador a l'estratègia ('simulatorDataSource').` });
        }
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
    get on() { return this.status === 'on'; }
    get off() { return this.status === 'off'; }
    get paused() { return this.status === 'paused'; }
    get readyToStart() { return this.marketReady && this.limitsReady && this.accountReady && this.instancesReady; }
    get market() { var _a; return (_a = this.strategy) === null || _a === void 0 ? void 0 : _a.market; }
    get symbol() { var _a; return (_a = this.strategy) === null || _a === void 0 ? void 0 : _a.symbol; }
    get quoteAsset() { return this.strategy.quoteAsset; }
    get baseAsset() { return this.strategy.baseAsset; }
    get leverage() { return this.strategy.params.leverage; }
    get accountId() { var _a; return `${(_a = this.account) === null || _a === void 0 ? void 0 : _a.idreg}`; }
    get strategyId() { var _a; return `${(_a = this.strategy) === null || _a === void 0 ? void 0 : _a.idreg}`; }
    get controllerId() { return `${this.account.idreg}-${this.strategy.idreg}`; }
    get accountMarket() { return this.account.markets[this.market]; }
    get limitsReady() { return this.accountMarket.executor.limitsReady; }
    get marketSymbol() { return this.exchange.symbols.find(s => s.symbol === this.symbol); }
    fixPrice(price) { return +price.toFixed(this.marketSymbol.pricePrecision || 3); }
    fixQuantity(quantity) { return +quantity.toFixed(this.marketSymbol.quantityPrecision || 2); }
    fixBase(base) { return +base.toFixed(this.marketSymbol.basePrecision); }
    fixQuote(quote) { return +quote.toFixed(this.marketSymbol.quotePrecision); }
    floorQuantity(quantity) {
        const decimals = this.marketSymbol.quantityPrecision || 2;
        return (Math.floor(quantity * Math.pow(10, decimals)) / Math.pow(10, decimals));
    }
    get simulated() { var _a; return ((_a = this.strategy) === null || _a === void 0 ? void 0 : _a.exchange) === 'simulator'; }
    get simulator() { return this.exchange; }
    set simulate(data) { if (this.simulated) {
        this.simulation.push(data);
    } ; }
    createInstance() {
        const instance = {
            id: ++this.lastInstanceId,
            created: (0, node_utils_1.timestamp)(),
            updated: (0, node_utils_1.timestamp)(),
            lastOrderId: 0,
            orders: [],
            balances: this.createBalances(),
        };
        return instance;
    }
    createBalances() {
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
    getInstanceByOrderId(id) {
        const { instanceId } = (0, shared_1.splitOrderId)(id);
        return this.instances.find(i => i.id === instanceId);
    }
    start() {
        if (!this.readyToStart) {
            return false;
        }
        console.log(this.constructor.name + ' -> start()');
        return this.resume();
    }
    pause() {
        this.status = 'paused';
    }
    resume() {
        const { symbol, market, exchange, params } = this.strategy;
        if (!this.checkOrders()) {
            return false;
        }
        this.status = 'on';
        console.log(this.constructor.name + ' -> resume()');
        return true;
    }
    stop() {
        console.log(this.constructor.name + ' -> stop()');
        this.status = 'off';
    }
    abort() {
        console.log(this.constructor.name + ' -> abort()');
        this.status = 'off';
    }
    checkOrders() {
        const missing = this.instances.reduce((prev, instance) => {
            prev.push(...instance.orders.reduce((p, o) => {
                if (!this.accountMarket.orders.find(m => m.id === o.id)) {
                    p.push(o);
                }
                return p;
            }, []));
            return prev;
        }, []);
        this.ordersReady = !missing.length;
        if (missing.length && !this.ordersRequested) {
            this.ordersRequested = true;
            missing.map(o => this.getOrder(o));
        }
        return this.ordersReady;
    }
    do(task) { this.accountMarket.executor.do(task); }
    getOrder(order) {
        const { account, controllerId } = this;
        this.do({ type: 'getOrder', data: { account, controllerId, order } });
    }
    createOrderBuyMarket(instance, baseQuantity, price) {
        const { account, controllerId } = this;
        const order = this.createOrder(instance, 'buy', 'market', baseQuantity, { price });
        this.do({ type: 'postOrder', data: { account, controllerId, order } });
    }
    createOrderSellMarket(instance, baseQuantity, price, idOrderBuyed) {
        const { account, controllerId } = this;
        const order = this.createOrder(instance, 'sell', 'market', baseQuantity, { price, idOrderBuyed });
        this.do({ type: 'postOrder', data: { account, controllerId, order } });
    }
    createOrderSellStopMarket(instance, baseQuantity, price, idOrderBuyed) {
        const { account, controllerId } = this;
        const order = this.createOrder(instance, 'sell', 'stop_market', baseQuantity, { price, idOrderBuyed });
        this.do({ type: 'postOrder', data: { account, controllerId, order } });
    }
    createOrderBuyLimit(instance, baseQuantity, price) {
        const { account, controllerId } = this;
        const order = this.createOrder(instance, 'buy', 'limit', baseQuantity, { price });
        this.do({ type: 'postOrder', data: { account, controllerId, order } });
    }
    createOrderSellLimit(instance, baseQuantity, price, idOrderBuyed) {
        const { account, controllerId } = this;
        const order = this.createOrder(instance, 'sell', 'limit', baseQuantity, { price, idOrderBuyed });
        this.do({ type: 'postOrder', data: { account, controllerId, order } });
    }
    createOrderBuyOco(instance, baseQuantityA, baseQuantityB, priceA, priceB) {
        const { account, controllerId } = this;
        const orderA = this.createOrder(instance, 'buy', this.market === 'spot' ? 'stop_loss_limit' : 'stop_market', baseQuantityA, { price: priceA, stopPrice: priceA });
        const orderB = this.createOrder(instance, 'buy', this.market === 'spot' ? 'limit' : 'stop_market', baseQuantityB, { price: priceB, stopPrice: priceB });
        orderA.id = `${orderA.id}-A`;
        orderB.id = `${orderB.id}-B`;
        orderA.isOco = true;
        orderB.isOco = true;
        this.do({ type: 'postOrder', data: { account, controllerId, order: orderA } });
        this.do({ type: 'postOrder', data: { account, controllerId, order: orderB } });
    }
    cancelOrder(instance, order) {
        const { account, controllerId } = this;
        this.do({ type: 'cancelOrder', data: { account, controllerId, order } });
    }
    createOrder(instance, side, type, baseQuantity, options) {
        let { price, status, idOrderBuyed } = options;
        if (status === undefined) {
            status = 'post';
        }
        if (price) {
            price = this.fixPrice(price);
        }
        if (baseQuantity) {
            baseQuantity = this.adjustQuantity(instance, baseQuantity);
        }
        const order = {
            id: this.generateOrderId(instance),
            exchangeId: undefined,
            symbol: this.strategy.symbol,
            side,
            type,
            status,
            baseQuantity,
            price,
            isOco: false,
            created: (0, node_utils_1.timestamp)(),
        };
        if (idOrderBuyed !== undefined) {
            order.idOrderBuyed = idOrderBuyed;
        }
        instance.orders.push(order);
        return order;
    }
    adjustQuantity(instance, baseQuantity) {
        const { baseAsset } = this;
        const marketBalances = this.accountMarket.balances;
        const adjusted = this.floorQuantity(baseQuantity);
        const remainder = baseQuantity - adjusted;
        if (remainder > 0) {
            instance.balances[baseAsset].remainder = this.fixBase(instance.balances[baseAsset].remainder + remainder);
            this.balances[baseAsset].remainder = this.fixBase(this.balances[baseAsset].remainder + remainder);
            marketBalances[baseAsset].remainder = this.fixBase(marketBalances[baseAsset].remainder + remainder);
        }
        return adjusted;
    }
    cancelInstanceOrders(instance) {
        const orders = instance.orders.map(o => o);
        orders.map(order => {
            order.status === 'cancel';
            this.cancelOrder(instance, order);
        });
    }
    checkSymbol(symbols) {
        if (!symbols) {
            return;
        }
        const marketSymbol = symbols.find(symbol => symbol === this.strategy.symbol);
        if (marketSymbol) {
            console.log('BaseController.checkSymbol()', [marketSymbol]);
        }
        else {
            const { symbol, market, exchange } = this.strategy;
            this.abort();
            throw ({ message: `No se ha encontrado el símbolo '${symbol}' para el market '${market}' en el exchange '${exchange}'` });
        }
    }
    updateMarketStatus(status) {
        if (!status) {
            return;
        }
        const { symbol, ready } = status;
        if (symbol !== this.symbol) {
            return;
        }
        if (this.marketReady !== ready) {
            console.log('BaseController.updateMarketStatus()', status);
            this.marketReady = ready;
            if (this.off) {
                this.start();
            }
            else {
                if (this.on && !ready) {
                    this.pause();
                }
                else if (this.paused && ready) {
                    this.resume();
                }
            }
        }
    }
    processAccountEvents(event) {
        if (!event) {
            return;
        }
        switch (event.type) {
            case 'accountReady':
                console.log('processAccountEvents -> accountReady', event);
                const status = event;
                if (status.ready) {
                    this.accountReady = true;
                    if (this.off) {
                        this.start();
                    }
                }
                break;
            case 'accountUpdate':
                break;
        }
    }
    processOrdersEvents(eventOrder) {
        if (!event) {
            return false;
        }
        const result = eventOrder;
        if (!this.ordersReady || !this.on) {
            console.log('processOrdersEvents', { ordersReady: this.ordersReady, status: this.status });
        }
        if (!this.ordersReady && !this.on) {
            this.resume();
            return false;
        }
        this.processBalanceOrderUpdate(eventOrder);
        const instance = this.getInstanceByOrderId(eventOrder.id);
        const order = instance.orders.find(o => o.id === eventOrder.id);
        if (order === undefined || eventOrder === undefined) {
            console.log('UNDEFINED!!!!!!!!', order, eventOrder);
        }
        Object.assign(order, eventOrder);
        return true;
    }
    processBalanceOrderUpdate(eventOrder) {
        const instance = this.getInstanceByOrderId(eventOrder.id);
        const { id } = eventOrder;
        const oldOrder = instance.orders.find(o => o.id === id);
        this.updateBalances(eventOrder, oldOrder, instance.balances[this.baseAsset], instance.balances[this.quoteAsset]);
        this.updateBalances(eventOrder, oldOrder, this.balances[this.baseAsset], this.balances[this.quoteAsset]);
    }
    updateBalances(eventOrder, oldOrder, base, quote) {
        const { id, side, status, type, baseQuantity, quoteQuantity, price, profit } = eventOrder;
        const { commission, commissionAsset } = eventOrder;
        const { quoteAsset, baseAsset, leverage } = this;
        switch (status) {
            case 'new':
                if (side === 'buy') {
                    quote.locked = this.fixQuote(quote.locked + this.fixQuote(baseQuantity * price));
                    quote.available = this.fixQuote(quote.available - this.fixQuote(baseQuantity * price));
                }
                else {
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
                }
                else {
                    base.locked = this.fixBase(base.locked - baseQuantity);
                    base.available = this.fixBase(base.available + baseQuantity);
                }
                break;
            case 'filled':
            case 'unsatisfied':
                if (side === 'buy') {
                    quote.locked = this.fixQuote(quote.locked - this.fixQuote(oldOrder.baseQuantity * oldOrder.price));
                    quote.available = this.fixQuote(quote.available + (oldOrder.baseQuantity * price));
                }
                else {
                    base.locked = this.fixBase(base.locked - oldOrder.baseQuantity);
                    base.available = this.fixBase(base.available + oldOrder.baseQuantity);
                }
                const quoteCommission = commissionAsset === quoteAsset ? this.fixQuote(commission) : 0.0;
                const baseCommission = commissionAsset === baseAsset ? this.fixBase(commission) : 0.0;
                quote.balance = this.fixQuote(quote.balance - quoteCommission);
                base.balance = this.fixBase(base.balance - baseCommission);
                if (this.market === 'spot') {
                    if (side === 'buy') {
                        quote.balance = this.fixQuote(quote.balance - quoteQuantity);
                        quote.available = this.fixQuote(quote.available - quoteQuantity);
                        base.balance = this.fixBase(base.balance + baseQuantity);
                        base.available = this.fixBase(base.available + baseQuantity);
                    }
                    else {
                        quote.balance = this.fixQuote(quote.balance + quoteQuantity);
                        quote.available = this.fixQuote(quote.available + quoteQuantity);
                        base.balance = this.fixBase(base.balance - baseQuantity);
                        base.available = this.fixBase(base.available - baseQuantity);
                    }
                }
                else if (this.market === 'futures') {
                    if (side === 'buy') {
                        base.balance = this.fixBase(base.balance + baseQuantity);
                        base.available = this.fixBase(base.available + baseQuantity);
                    }
                    else {
                        base.balance = this.fixBase(base.balance - baseQuantity);
                        base.available = this.fixBase(base.available - baseQuantity);
                        quote.balance = this.fixQuote(quote.balance + profit);
                    }
                }
                quote.fee = this.fixQuote(quote.fee + quoteCommission);
                base.fee = this.fixBase(base.fee + baseCommission);
        }
    }
    latenteAndMargin(price) {
        return this.fixQuote(this.instances.reduce((total, instance) => {
            const base = instance.balances[this.baseAsset];
            const averagePrice = this.accountMarket.averagePrices[this.symbol];
            const latente = (price - averagePrice) * base.balance;
            const margin = -(price * base.balance / this.leverage);
            total += latente + margin;
            return total;
        }, 0.0));
    }
    generateOrderId(instance) {
        return `${this.accountId}-${this.strategyId}-${instance.id}-${++instance.lastOrderId}`;
    }
    get availbleBalanceAsset() { return this.accountMarket.balances[this.quoteAsset].available; }
}
exports.AbstractController = AbstractController;
//# sourceMappingURL=abstract-controller.js.map