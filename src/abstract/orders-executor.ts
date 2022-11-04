import { BehaviorSubject } from "rxjs";

import { Order, Strategy, Task, CoinType, OrderTask } from './types';
import { ExchangeAccount } from "./exchange-account";
import { Limit, TaskExecutor, TaskExecutorOptions } from "./task-executor";
import { AbstractExchange } from "./abstract-exchange";


export class OrdersExecutor extends TaskExecutor {

  // limitsReady = false;

  // ordersLimitsChanged = new BehaviorSubject<Limit>(undefined);

  constructor(
    public account: ExchangeAccount,
    public strategy: Strategy,
    public exchange: AbstractExchange,
    public options?: TaskExecutorOptions,
  ) {
    super(options); // spot orders limit ratio => 5/s

    exchange.ordersLimitsChanged.subscribe(limit => this.updateOrdersLimit(limit));
  }


  // ---------------------------------------------------------------------------------------------------
  //  limit
  // ---------------------------------------------------------------------------------------------------

  protected updateOrdersLimit(ordersLimit: Limit): void {
    if (!ordersLimit) { return; }
    console.log('OrdersExecutor.updateOrdersLimit()', ordersLimit);
    this.updateLimit(ordersLimit);
    // this.limitsReady = true;
    // this.ordersLimitsChanged.next(ordersLimit);
  }


  // ---------------------------------------------------------------------------------------------------
  //  Ids
  // ---------------------------------------------------------------------------------------------------

  get accountId(): string { return `${this.account?.idUser}`}

  get strategyId(): string { return `${this.strategy?.idreg}`}
  
  get controllerId(): string { return `${this.account.idUser}-${this.strategy.idreg}`}


  // ---------------------------------------------------------------------------------------------------
  //  TaskExecutor
  // ---------------------------------------------------------------------------------------------------

  protected executeTask(task: OrderTask): Promise<any> {
    switch (task.type) {
      case 'getOrder': this.exchange.getOrder(task); break;
      case 'postOrder': this.exchange.postOrder(task); break;
      case 'cancelOrder': this.exchange.cancelOrder(task); break;
      default:
        throw { code: 500, message: `No s'ha implementat la tasca de tipus '${task.type}'.` };
    }
    // NOTA: La promise només és necessària per a una execució seqüencial (sync) i estem en un paradigma async.
    return Promise.resolve();
  }

}
