"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractExchange = void 0;
const rxjs_1 = require("rxjs");
const task_executor_1 = require("../utils/task-executor");
class AbstractExchange extends task_executor_1.TaskExecutor {
    constructor(market) {
        super({ run: 'async', maxQuantity: 5, period: 1 });
        this.market = market;
        this.ordersLimitsChanged = new rxjs_1.BehaviorSubject(undefined);
    }
    do(task) { super.do(task); }
    getOrder(task) { this.do(task); }
    postOrder(task) { this.do(task); }
    cancelOrder(task) { this.do(task); }
}
exports.AbstractExchange = AbstractExchange;
//# sourceMappingURL=abstract-exchange.js.map