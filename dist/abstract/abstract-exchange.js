"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractExchange = void 0;
const rxjs_1 = require("rxjs");
const task_executor_1 = require("./task-executor");
const shared_1 = require("./shared");
class AbstractExchange extends task_executor_1.TaskExecutor {
    constructor(market) {
        super({ run: 'async', maxQuantity: 5, period: 1 });
        this.market = market;
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
    getMarketPriceSubject(symbol) {
        if (this.marketPriceSubjects[symbol]) {
            return this.marketPriceSubjects[symbol];
        }
        else {
            return this.createMarketPriceSubject(symbol);
        }
    }
    getMarketKlineSubject(symbol, interval) {
        if (this.marketKlineSubjects[`${symbol}_${interval}`]) {
            return this.marketKlineSubjects[`${symbol}_${interval}`];
        }
        else {
            return this.createMarketKlineSubject(symbol, interval);
        }
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
    processGetOrderTask(account, order) {
        const { accountId, strategyId } = (0, shared_1.splitOrderId)(order.id);
        const controllerId = `${accountId}-${strategyId}`;
        account.markets[this.market].orders.push(order);
        this.ordersEventsSubjects[controllerId].next({ order, data: {} });
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
    processOrderUpdate(account, event) {
        const { accountId, strategyId } = (0, shared_1.splitOrderId)(event.order.id);
        const controllerId = `${accountId}-${strategyId}`;
        const order = account.markets[this.market].orders.find(o => o.id === event.order.id);
        if (!order) {
            return;
        }
        Object.assign(order, event.order);
        if (event.order.status === 'partial') {
            this.processPartialFilled(account, order);
        }
        else {
            if (event.order.status === 'filled') {
                this.completePartialFilled(account, order);
            }
            this.ordersEventsSubjects[controllerId].next({ order, data: event.data });
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
        this.ordersEventsSubjects[controllerId].next({ order, data: {} });
    }
    isExecutedStatus(status) { return status === 'new' || status === 'expired'; }
}
exports.AbstractExchange = AbstractExchange;
//# sourceMappingURL=abstract-exchange.js.map