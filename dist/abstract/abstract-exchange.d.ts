import { BehaviorSubject } from 'rxjs';
import { Limit, TaskExecutor } from '../utils/task-executor';
import { MarketType } from './types';
import { OrderTask } from './types';
export declare abstract class AbstractExchange extends TaskExecutor {
    market: MarketType;
    ordersLimitsChanged: BehaviorSubject<Limit>;
    constructor(market: MarketType);
    do(task: OrderTask): void;
    getOrder(task: OrderTask): void;
    postOrder(task: OrderTask): void;
    cancelOrder(task: OrderTask): void;
}
//# sourceMappingURL=abstract-exchange.d.ts.map