import { AbstractAccount } from "./abstract-account";
import { AbstractExchange } from "./abstract-exchange";
import { AccountEvent, AccountMarket, Balance, CoinType, InstanceController, MarketSymbol, MarketType, Order, OrderEvent, OrderSide, OrderStatus, OrderType, SimulationData, Strategy, SymbolType } from "./types";
export declare type ControllerStatus = 'on' | 'paused' | 'off';
export declare abstract class AbstractController {
    account: AbstractAccount;
    strategy: Strategy;
    exchange: AbstractExchange;
    protected config: {
        [key: string]: any;
    };
    instances: InstanceController[];
    balances: {
        [key: string]: Balance;
    };
    marketReady: boolean;
    accountReady: boolean;
    instancesReady: boolean;
    ordersRequested: boolean;
    ordersReady: boolean;
    status: ControllerStatus;
    lastInstanceId: number;
    simulation: SimulationData[];
    constructor(account: AbstractAccount, strategy: Strategy, exchange: AbstractExchange);
    protected abstract loadAppSettings(): {
        [key: string]: any;
    };
    protected subscribeToExchangeEvents(): void;
    protected abstract loadInstances(): Promise<InstanceController[]>;
    protected abstract saveInstance(instance: InstanceController): void;
    protected abstract deleteInstance(instance: InstanceController): void;
    protected initSimulation(): void;
    get on(): boolean;
    get off(): boolean;
    get paused(): boolean;
    get readyToStart(): boolean;
    get market(): MarketType;
    get symbol(): SymbolType;
    get quoteAsset(): CoinType;
    get baseAsset(): CoinType;
    get leverage(): number;
    get accountId(): string;
    get strategyId(): string;
    get controllerId(): string;
    get accountMarket(): AccountMarket;
    get limitsReady(): boolean;
    get marketSymbol(): MarketSymbol;
    fixPrice(price: number): number;
    fixQuantity(quantity: number): number;
    fixBase(base: number): number;
    fixQuote(quote: number): number;
    floorQuantity(quantity: number): number;
    get simulated(): boolean;
    get simulator(): AbstractExchange;
    set simulate(data: SimulationData);
    protected createInstance(): InstanceController;
    protected createBalances(): {
        [x: string]: {
            asset: CoinType;
            balance: number;
            available: number;
            locked: number;
            remainder: number;
            fee: number;
        };
    };
    protected getInstanceByOrderId(id: string): InstanceController;
    start(): boolean;
    pause(): void;
    resume(): boolean;
    stop(): void;
    abort(): void;
    protected checkOrders(): boolean;
    private do;
    protected getOrder(order: Order): void;
    protected createOrderBuyMarket(instance: InstanceController, baseQuantity: number, price?: number): void;
    protected createOrderSellMarket(instance: InstanceController, baseQuantity: number, price?: number, idOrderBuyed?: string): void;
    protected createOrderSellStopMarket(instance: InstanceController, baseQuantity: number, price?: number, idOrderBuyed?: string): void;
    protected createOrderBuyLimit(instance: InstanceController, baseQuantity: number, price: number): void;
    protected createOrderSellLimit(instance: InstanceController, baseQuantity: number, price: number, idOrderBuyed?: string): void;
    protected createOrderBuyOco(instance: InstanceController, baseQuantityA: number, baseQuantityB: number, priceA: number, priceB: number): void;
    protected cancelOrder(instance: InstanceController, order: Order): void;
    protected createOrder(instance: InstanceController, side: OrderSide, type: OrderType, baseQuantity: number, options: {
        price?: number;
        stopPrice?: number;
        status?: OrderStatus;
        idOrderBuyed?: string;
    }): Order;
    private adjustQuantity;
    protected cancelInstanceOrders(instance: InstanceController): void;
    protected checkSymbol(symbols: SymbolType[]): void;
    protected updateMarketStatus(status: MarketSymbol): void;
    protected processAccountEvents(event: AccountEvent): void;
    protected processOrdersEvents(event: OrderEvent): boolean;
    protected processBalanceOrderUpdate(event: OrderEvent): void;
    protected updateBalances(event: OrderEvent, oldOrder: Order, base: Balance, quote: Balance): void;
    latenteAndMargin(price: number): number;
    protected generateOrderId(instance: InstanceController): string;
    get availbleBalanceAsset(): Number;
}
//# sourceMappingURL=abstract-controller.d.ts.map