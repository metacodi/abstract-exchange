import moment from 'moment';
import { Subscription } from 'rxjs';
export interface Limit {
    type: string;
    maxQuantity: number;
    period: number;
    unitOfTime?: moment.unitOfTime.DurationAs;
}
export interface Interval {
    period: number;
    unitOfTime?: moment.unitOfTime.DurationAs;
}
export interface TaskExecutorOptions {
    add?: 'unshift' | 'push';
    consume?: 'shift' | 'pop';
    run?: 'sync' | 'async';
    delay?: number;
    maxQuantity?: number;
    period?: number;
}
export declare abstract class TaskExecutor {
    options?: TaskExecutorOptions;
    queue: any[];
    executingTask: boolean;
    changeLimitsPending: boolean;
    countPeriod: number;
    intervalSubscription: Subscription;
    constructor(options?: TaskExecutorOptions);
    do(task: any): void;
    protected executeQueue(): void;
    protected abstract executeTask(task: any): Promise<any>;
    protected nextTask(): void;
    protected startTasksInterval(): void;
    protected stopTasksInterval(): void;
    protected processTasksInterval(): void;
    protected get isTaskIntervalOn(): boolean;
    updateLimit(limit: Limit): void;
    protected addTask(task: any): void;
    protected consumeTask(): any;
    protected get hasTasksToConsume(): boolean;
    protected sortTasksByPriority(): void;
    protected get hasPriority(): boolean;
    get run(): 'sync' | 'async';
    get add(): 'unshift' | 'push';
    get consume(): 'shift' | 'pop';
    get delay(): number;
    get period(): number;
    get maxQuantity(): number;
}
//# sourceMappingURL=task-executor.d.ts.map