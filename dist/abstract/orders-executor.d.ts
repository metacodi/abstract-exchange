import { Strategy, OrderTask } from './types';
import { ExchangeAccount } from "./exchange-account";
import { Limit, TaskExecutor, TaskExecutorOptions } from "../utils/task-executor";
import { AbstractExchange } from "./abstract-exchange";
export declare class OrdersExecutor extends TaskExecutor {
    account: ExchangeAccount;
    strategy: Strategy;
    exchange: AbstractExchange;
    options?: TaskExecutorOptions;
    constructor(account: ExchangeAccount, strategy: Strategy, exchange: AbstractExchange, options?: TaskExecutorOptions);
    protected updateOrdersLimit(ordersLimit: Limit): void;
    get accountId(): string;
    get strategyId(): string;
    get controllerId(): string;
    protected executeTask(task: OrderTask): Promise<any>;
}
//# sourceMappingURL=orders-executor.d.ts.map