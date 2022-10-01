import { BehaviorSubject } from "rxjs";
import { Strategy, OrderTask } from './types';
import { AbstractAccount } from "./abstract-account";
import { Limit, TaskExecutor, TaskExecutorOptions } from "./task-executor";
import { AbstractExchange } from "./abstract-exchange";
export declare class OrdersExecutor extends TaskExecutor {
    account: AbstractAccount;
    strategy: Strategy;
    exchange: AbstractExchange;
    options?: TaskExecutorOptions;
    limitsReady: boolean;
    ordersLimitsChanged: BehaviorSubject<Limit>;
    constructor(account: AbstractAccount, strategy: Strategy, exchange: AbstractExchange, options?: TaskExecutorOptions);
    protected updateOrdersLimit(ordersLimit: Limit): void;
    get accountId(): string;
    get strategyId(): string;
    get controllerId(): string;
    protected executeTask(task: OrderTask): Promise<any>;
}
//# sourceMappingURL=orders-executor.d.ts.map