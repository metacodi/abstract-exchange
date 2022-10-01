"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersExecutor = void 0;
const rxjs_1 = require("rxjs");
const task_executor_1 = require("./task-executor");
class OrdersExecutor extends task_executor_1.TaskExecutor {
    constructor(account, strategy, exchange, options) {
        super(options);
        this.account = account;
        this.strategy = strategy;
        this.exchange = exchange;
        this.options = options;
        this.limitsReady = false;
        this.ordersLimitsChanged = new rxjs_1.BehaviorSubject(undefined);
        exchange.ordersLimitsChanged.subscribe(limit => this.updateOrdersLimit(limit));
    }
    updateOrdersLimit(ordersLimit) {
        if (!ordersLimit) {
            return;
        }
        console.log('OrdersExecutor.updateOrdersLimit()', ordersLimit);
        this.updateLimit(ordersLimit);
        this.limitsReady = true;
        this.ordersLimitsChanged.next(ordersLimit);
    }
    get accountId() { var _a; return `${(_a = this.account) === null || _a === void 0 ? void 0 : _a.idreg}`; }
    get strategyId() { var _a; return `${(_a = this.strategy) === null || _a === void 0 ? void 0 : _a.idreg}`; }
    get controllerId() { return `${this.account.idreg}-${this.strategy.idreg}`; }
    executeTask(task) {
        switch (task.type) {
            case 'getOrder':
                this.exchange.getOrder(task);
                break;
            case 'postOrder':
                this.exchange.postOrder(task);
                break;
            case 'cancelOrder':
                this.exchange.cancelOrder(task);
                break;
            default:
                throw new Error(`No s'ha implementat la tasca de tipus '${task.type}'.`);
        }
        return Promise.resolve();
    }
}
exports.OrdersExecutor = OrdersExecutor;
//# sourceMappingURL=orders-executor.js.map