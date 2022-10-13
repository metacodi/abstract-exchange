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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exchange = void 0;
const rxjs_1 = require("rxjs");
const task_executor_1 = require("./task-executor");
const shared_1 = require("./shared");
const moment_1 = __importDefault(require("moment"));
class Exchange extends task_executor_1.TaskExecutor {
    constructor(market) {
        super({ run: 'async', maxQuantity: 5, period: 1 });
        this.market = market;
        this.accountsWs = {};
        this.symbols = [];
        this.balanceLocketIsMissing = true;
        this.isReady = false;
        this.exchangeInfoUpdated = new rxjs_1.Subject();
        this.ordersLimitsChanged = new rxjs_1.BehaviorSubject(undefined);
        this.marketKlineSubjects = {};
        this.marketPriceSubjects = {};
        this.accountEventsSubjects = {};
        this.ordersEventsSubjects = {};
        this.partialPeriod = 1000 * 10;
        this.partials = {};
        this.retrieveExchangeInfo();
    }
    retrieveExchangeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.constructor.name + '.retrieveExchangeInfo()');
            const api = this.getApiClient();
            api.getExchangeInfo().then(response => {
                this.processExchangeLimits(response.limits);
                this.isReady = true;
                this.exchangeInfoUpdated.next();
            }).catch(error => {
                console.error('getExchangeInfo error: ', error);
            });
        });
    }
    processExchangeLimits(rateLimits) {
        const findLimit = (rateLimitType, limits) => {
            return limits
                .filter(l => l.type === rateLimitType && moment_1.default.duration(1, l.unitOfTime).asSeconds() <= 60)
                .reduce((prev, cur) => (!prev || (cur.maxQuantity / cur.period < prev.maxQuantity / prev.period)) ? cur : prev);
        };
        const limitChanged = (limitA, limitB) => !limitA || !limitB || limitA.maxQuantity !== limitB.maxQuantity || limitA.period !== limitB.period;
        const requests = findLimit('request', rateLimits);
        const orders = findLimit('trade', rateLimits);
        if (requests && limitChanged(this.limitRequest, requests)) {
            this.limitRequest = requests;
            this.updateLimit(requests);
        }
        if (orders && limitChanged(this.limitOrders, orders)) {
            this.limitOrders = orders;
            this.ordersLimitsChanged.next(orders);
        }
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
        const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
        if (this.marketPriceSubjects[symbolKey]) {
            return this.marketPriceSubjects[symbolKey];
        }
        else {
            return this.createMarketPriceSubject(symbol);
        }
    }
    createMarketPriceSubject(symbol) {
        const ws = this.getMarketWebsocket(symbol);
        const subject = new rxjs_1.Subject();
        const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
        this.marketPriceSubjects[symbolKey] = subject;
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
        const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
        if (this.marketKlineSubjects[`${symbolKey}_${interval}`]) {
            return this.marketKlineSubjects[`${symbolKey}_${interval}`];
        }
        else {
            return this.createMarketKlineSubject(symbol, interval);
        }
    }
    createMarketKlineSubject(symbol, interval) {
        const ws = this.getMarketWebsocket(symbol);
        const subject = new rxjs_1.Subject();
        const symbolKey = `${symbol.baseAsset}_${symbol.quoteAsset}`;
        this.marketKlineSubjects[`${symbolKey}_${interval}`] = subject;
        ws.klineTicker(symbol, interval).subscribe(data => subject.next(data));
        return subject;
    }
    getMarketSymbol(symbol) {
        const api = this.getApiClient();
        return api.getMarketSymbol(symbol);
    }
    getAccountWebsocket(account) {
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
        const ws = this.getAccountWebsocket(account);
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
            this.processInitialBalances(account, info.balances);
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
            const coin = balance.asset;
            const balances = account.markets[this.market].balances;
            if (!balances[coin]) {
                balances[coin] = balance;
            }
            ;
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
                this.balanceLocketIsMissing = balance.locked === undefined;
                if (balance.balance !== undefined) {
                    accountMarket.balances[balance.asset].balance = balance.balance;
                }
                if (balance.available !== undefined) {
                    accountMarket.balances[balance.asset].available = balance.available;
                }
                if (balance.locked !== undefined) {
                    accountMarket.balances[balance.asset].locked = balance.locked;
                }
                balances.push(accountMarket.balances[balance.asset]);
            });
        }
        else {
            (_b = update.positions) === null || _b === void 0 ? void 0 : _b.map(position => {
                const symbolKey = `${position.symbol.baseAsset}_${position.symbol.quoteAsset}`;
                accountMarket.averagePrices[symbolKey] = position.entryPrice;
            });
            (_c = update.balances) === null || _c === void 0 ? void 0 : _c.map(balance => {
                accountMarket.balances[balance.asset].balance = balance.balance;
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
            api.getOrder({ symbol, id }).then(order => {
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
                if (this.balanceLocketIsMissing) {
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
    findMarketSymbol(symbol) {
        return this.symbols.find(s => s.symbol.baseAsset === symbol.baseAsset && s.symbol.quoteAsset === symbol.quoteAsset);
    }
    fixBase(base, symbol) {
        const found = this.findMarketSymbol(symbol);
        return +base.toFixed(found.basePrecision);
    }
    fixQuote(quote, symbol) {
        const found = this.findMarketSymbol(symbol);
        return +quote.toFixed(found.quotePrecision);
    }
}
exports.Exchange = Exchange;
//# sourceMappingURL=exchange.js.map