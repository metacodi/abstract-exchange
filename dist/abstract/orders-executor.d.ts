import { BehaviorSubject } from "rxjs";
import { Strategy, OrderTask } from './types';
import { ExchangeAccount } from "./exchange-account";
import { Limit, TaskExecutor, TaskExecutorOptions } from "./task-executor";
import { Exchange } from "./exchange";
export declare class OrdersExecutor extends TaskExecutor {
    account: ExchangeAccount;
    strategy: Strategy;
    exchange: Exchange;
    options?: TaskExecutorOptions;
    limitsReady: boolean;
    ordersLimitsChanged: BehaviorSubject<Limit>;
    constructor(account: ExchangeAccount, strategy: Strategy, exchange: Exchange, options?: TaskExecutorOptions);
    protected updateOrdersLimit(ordersLimit: Limit): void;
    get accountId(): string;
    get strategyId(): string;
    get controllerId(): string;
    protected executeTask(task: OrderTask): Promise<any>;
}
//# sourceMappingURL=orders-executor.d.ts.map