"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exchange = void 0;
const rxjs_1 = require("rxjs");
const task_executor_1 = require("./task-executor");
const types_1 = require("./types");
const shared_1 = require("./shared");
class Exchange extends task_executor_1.TaskExecutor {
    constructor(market) {
        super({ run: 'async', maxQuantity: 5, period: 1 });
        this.market = market;
        this.accountsWs = {};
        this.symbols = [];
        this.symbolsInitialized = new rxjs_1.BehaviorSubject(undefined);
        this.ordersLimitsChanged = new rxjs_1.BehaviorSubject(undefined);
        this.marketSymbolStatusChanged = new rxjs_1.BehaviorSubject(undefined);
        this.marketKlineSubjects = {};
        this.marketPriceSubjects = {};
        this.accountEventsSubjects = {};
        this.ordersEventsSubjects = {};
        this.partialPeriod = 1000 * 10;
        this.partials = {};
        setTimeout(() => this.retrieveExchangeInfo(), 100);
    }
    getApiClient(account) {
        if (!this.api) {
            switch (this.name) {
                case 'binance':
                    break;
                case 'kucoin':
                    break;
                case 'okx':
                    break;
            }
        }
        if (!!account) {
            this.api.setCredentials(account.exchanges[this.name]);
        }
        return this.api;
    }
    retrieveExchangeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.constructor.name + '.retrieveExchangeInfo()');
            const api = this.getApiClient();
            api.getExchangeInfo().then(response => {
                if (response === null || response === void 0 ? void 0 : response.symbols) {
                    this.processExchangeSymbols(response.symbols);
                }
                if (response === null || response === void 0 ? void 0 : response.limits) {
                    this.processExchangeLimits(response.limits);
                }
            }).catch(error => {
                console.error('getExchangeInfo error: ', error);
            });
        });
    }
    processExchangeSymbols(exchangeSymbols) {
        const firstTime = !this.symbols.length;
        for (const marketSymbol of exchangeSymbols) {
            const symbol = marketSymbol.symbol;
            if (symbol) {
                const found = this.symbols.find(s => s.symbol === symbol);
                if (found) {
                    const changed = found.ready !== marketSymbol.ready;
                    found.ready = marketSymbol.ready;
                    if (changed) {
                        this.marketSymbolStatusChanged.next(found);
                    }
                }
                else {
                    this.symbols.push(marketSymbol);
                    this.marketSymbolStatusChanged.next(marketSymbol);
                }
            }
        }
        if (firstTime) {
            this.symbolsInitialized.next(this.symbols.map(s => s.symbol));
        }
    }
    processExchangeLimits(rateLimits) {
    }
    getMarketWebsocket(symbol) {
        if (this.marketWs) {
            return this.marketWs;
        }
        switch (this.name) {
            case 'binance':
                break;
            case 'kucoin':
                break;
            case 'okx':
                break;
        }
        return this.marketWs;
    }
    getMarketPriceSubject(symbol) {
        if (this.marketPriceSubjects[symbol]) {
            return this.marketPriceSubjects[symbol];
        }
        else {
            return this.createMarketPriceSubject(symbol);
        }
    }
    createMarketPriceSubject(symbol) {
        const ws = this.getMarketWebsocket(symbol);
        const subject = new rxjs_1.Subject();
        this.marketPriceSubjects[symbol] = subject;
        ws.priceTicker(symbol).subscribe(data => subject.next(data));
        return subject;
    }
    getMarketPrice(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            this.countPeriod++;
            const api = this.getApiClient();
            return api.getPriceTicker(symbol);
        });
    }
    getMarketKlineSubject(symbol, interval) {
        if (this.marketKlineSubjects[`${symbol}_${interval}`]) {
            return this.marketKlineSubjects[`${symbol}_${interval}`];
        }
        else {
            return this.createMarketKlineSubject(symbol, interval);
        }
    }
    createMarketKlineSubject(symbol, interval) {
        const ws = this.getMarketWebsocket(symbol);
        const subject = new rxjs_1.Subject();
        this.marketKlineSubjects[`${symbol}_${interval}`] = subject;
        ws.klineTicker(symbol, interval).subscribe(data => subject.next(data));
        return subject;
    }
    getAccountWebsocket(account, symbol) {
        const accountId = `${account.idreg}`;
        const stored = this.accountsWs[accountId];
        if (stored) {
            return stored;
        }
        const { apiKey, apiSecret } = account.exchanges[this.name];
        let created;
        switch (this.name) {
            case 'binance':
                break;
            case 'kucoin':
                break;
        }
        this.accountsWs[accountId] = created;
        return created;
    }
    getAccountEventsSubject(account, symbol) {
        const accountId = `${account.idreg}`;
        if (this.accountEventsSubjects[accountId]) {
            return this.accountEventsSubjects[accountId];
        }
        else {
            return this.createAccountEventsSubject(account, symbol);
        }
    }
    createAccountEventsSubject(account, symbol) {
        const ws = this.getAccountWebsocket(account, symbol);
        const subject = new rxjs_1.Subject();
        const accountId = `${account.idreg}`;
        this.accountEventsSubjects[accountId] = subject;
        this.retrieveAcountInfo(account).then(ready => subject.next({ type: 'accountReady', ready }));
        ws.accountUpdate().subscribe(balance => this.onAccountUpdate(account, balance));
        ws.orderUpdate().subscribe(order => this.onOrderUpdate(account, order));
        return subject;
    }
    retrieveAcountInfo(account) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.constructor.name + '.retrieveAcountInfo()');
            const api = this.getApiClient(account);
            const info = yield api.getAccountInfo();
            const canTrade = !!(info === null || info === void 0 ? void 0 : info.canTrade);
            if (!canTrade) {
                throw ({ message: `No es pot fer trading amb el compte '${account.idreg}' al mercat '${this.market}'.` });
            }
            const coins = yield api.getBalances();
            this.processInitialBalances(account, coins);
            const balances = account.markets[this.market].balances;
            const balanceReady = !!Object.keys(balances).length;
            if (!balanceReady) {
                throw new Error(`Error recuperant els balanços del compte '${account.idreg}' al mercat '${this.market}'.`);
            }
            return Promise.resolve(balanceReady && canTrade);
        });
    }
    processInitialBalances(account, coins) {
        coins.forEach(balance => {
            const coin = types_1.acceptedCoins.find(c => c === balance.asset);
            if (coin) {
                const balances = account.markets[this.market].balances;
                if (!balances[coin]) {
                    balances[coin] = balance;
                }
                ;
            }
        });
    }
    onAccountUpdate(account, update) {
        var _a, _b, _c;
        const { market } = this;
        const accountId = `${account.idreg}`;
        const accountMarket = account.markets[this.market];
        const balances = [];
        if (this.market === 'spot') {
            (_a = update.balances) === null || _a === void 0 ? void 0 : _a.map(balance => {
                accountMarket.balances[balance.asset].balance = balance.free + balance.locked;
                accountMarket.balances[balance.asset].available = balance.free;
                accountMarket.balances[balance.asset].locked = balance.locked;
                balances.push(accountMarket.balances[balance.asset]);
            });
        }
        else {
            (_b = update.positions) === null || _b === void 0 ? void 0 : _b.map(position => {
                accountMarket.averagePrices[position.symbol] = position.entryPrice;
            });
            (_c = update.balances) === null || _c === void 0 ? void 0 : _c.map(balance => {
                accountMarket.balances[balance.asset].balance = balance.free;
                balances.push(accountMarket.balances[balance.asset]);
            });
        }
        this.accountEventsSubjects[accountId].next({ type: 'accountUpdate', market, balances });
    }
    do(task) { super.do(task); }
    getOrder(task) { this.do(task); }
    postOrder(task) { this.do(task); }
    cancelOrder(task) { this.do(task); }
    executeTask(task) {
        switch (task.type) {
            case 'getOrder':
                this.getOrderTask(task);
                break;
            case 'postOrder':
                this.postOrderTask(task);
                break;
            case 'cancelOrder':
                this.cancelOrderTask(task);
                break;
            default:
                throw new Error(`No s'ha implementat la tasca de tipus '${task.type}'.`);
        }
        return Promise.resolve();
    }
    getOrderTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const { account } = task.data;
            const api = this.getApiClient();
            const { symbol, id } = Object.assign({}, task.data.order);
            api.getOrder({ symbol, origClientOrderId: id }).then(order => {
                const { accountId, strategyId } = (0, shared_1.splitOrderId)(order.id);
                const controllerId = `${accountId}-${strategyId}`;
                account.markets[this.market].orders.push(order);
                this.ordersEventsSubjects[controllerId].next(order);
            });
        });
    }
    postOrderTask(task) {
        const { account } = task.data;
        const { market } = this;
        const api = this.getApiClient();
        const copy = Object.assign({}, task.data.order);
        account.markets[this.market].orders.push(copy);
        const order = {
            side: copy.side,
            symbol: copy.symbol,
            type: copy.type,
            price: copy.price,
            quantity: copy.baseQuantity,
            newClientOrderId: copy.id,
        };
        if (market === 'futures' && copy.type === 'stop_market') {
            order.closePosition = true;
        }
        return api.postOrder(order);
    }
    cancelOrderTask(task) {
        const { account, order } = task.data;
        const api = this.getApiClient();
        const found = account.markets[this.market].orders.find(o => o.id === order.id);
        if (found) {
            found.status = 'cancel';
        }
        return api.cancelOrder({
            symbol: order.symbol,
            origClientOrderId: order.id,
        });
    }
    getOrdersEventsSubject(account, controllerId) {
        if (this.ordersEventsSubjects[controllerId]) {
            return this.ordersEventsSubjects[controllerId];
        }
        else {
            const subject = new rxjs_1.Subject();
            this.ordersEventsSubjects[controllerId] = subject;
            return subject;
        }
    }
    onOrderUpdate(account, eventOrder) {
        const { name, market } = this;
        switch (eventOrder.status) {
            case 'new':
            case 'filled':
            case 'partial':
            case 'canceled':
            case 'expired':
            case 'rejected':
                const { accountId, strategyId } = (0, shared_1.splitOrderId)(eventOrder.id);
                const controllerId = `${accountId}-${strategyId}`;
                const order = account.markets[this.market].orders.find(o => o.id === eventOrder.id);
                if (!order) {
                    return;
                }
                Object.assign(order, eventOrder);
                if (eventOrder.status === 'partial') {
                    this.processPartialFilled(account, order);
                }
                else {
                    if (eventOrder.status === 'filled') {
                        this.completePartialFilled(account, order);
                    }
                    this.ordersEventsSubjects[controllerId].next(order);
                }
                break;
            default:
                const orderId = order.originalClientOrderId || order.clientOrderId;
                throw ({ message: `No s'ha implementat l'estat '${order.status}' d'ordre ${orderId} de Binance` });
        }
    }
    processPartialFilled(account, order) {
        if (!this.partials[order.id]) {
            this.partials[order.id] = { order, count: 0, accumulated: order.baseQuantity, subscription: undefined };
        }
        const partial = this.partials[order.id];
        if (partial.subscription) {
            partial.subscription.unsubscribe();
        }
        partial.subscription = (0, rxjs_1.timer)(this.partialPeriod).subscribe(() => this.notifyUnsatisfiedPartialOrder(account, partial));
        partial.accumulated += order.baseQuantity;
        partial.count += 1;
    }
    completePartialFilled(account, order) {
        const stored = this.partials[order.id];
        if (!stored) {
            return;
        }
        if (stored.subscription) {
            stored.subscription.unsubscribe();
        }
        delete this.partials[order.id];
    }
    notifyUnsatisfiedPartialOrder(account, partial) {
        partial.subscription.unsubscribe();
        const order = partial.order;
        const { accountId, strategyId } = (0, shared_1.splitOrderId)(order.id);
        const controllerId = `${accountId}-${strategyId}`;
        const found = account.markets[this.market].orders.find(o => o.id === order.id);
        order.status = 'unsatisfied';
        order.baseQuantity = partial.accumulated;
        delete this.partials[order.id];
        this.ordersEventsSubjects[controllerId].next(order);
    }
    isExecutedStatus(status) { return status === 'new' || status === 'expired'; }
    fixBase(base, symbol) {
        const found = this.symbols.find(s => s.symbol === symbol);
        return +base.toFixed(found.basePrecision);
    }
    fixQuote(quote, symbol) {
        const found = this.symbols.find(s => s.symbol === symbol);
        return +quote.toFixed(found.quotePrecision);
    }
}
exports.Exchange = Exchange;
//# sourceMappingURL=exchange.js.map