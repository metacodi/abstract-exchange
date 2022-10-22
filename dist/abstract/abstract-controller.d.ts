import { ExchangeAccount } from "./exchange-account";
import { Exchange } from "./exchange";
import { AccountEvent, AccountMarket, Balance, SymbolType, CoinType, InstanceController, MarketSymbol, MarketType, Order, OrderSide, OrderStatus, OrderType, SimulationData, Strategy } from "./types";
export declare type ControllerStatus = 'on' | 'paused' | 'off';
export declare abstract class AbstractController {
    account: ExchangeAccount;
    strategy: Strategy;
    exchange: Exchange;
    protected config: {
        [key: string]: any;
    };
    instances: InstanceController[];
    balances: {
        [key: string]: Balance;
    };
    marketSymbol: MarketSymbol;
    exchangeReady: boolean;
    accountReady: boolean;
    instancesReady: boolean;
    ordersRequested: boolean;
    ordersReady: boolean;
    status: ControllerStatus;
    lastInstanceId: number;
    simulation: SimulationData[];
    constructor(account: ExchangeAccount, strategy: Strategy, exchange: Exchange);
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
    fixPrice(price: number): number;
    fixQuantity(quantity: number): number;
    fixBase(base: number): number;
    fixQuote(quote: number): number;
    floorQuantity(quantity: number): number;
    get simulated(): boolean;
    get simulator(): Exchange;
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
    protected createOrderBuyLimit(instance: InstanceController, baseQuantity: number, price: number): void;
    protected createOrderSellLimit(instance: InstanceController, baseQuantity: number, price: number, idOrderBuyed?: string): void;
    protected cancelOrder(instance: InstanceController, order: Order): void;
    protected createOrder(instance: InstanceController, side: OrderSide, type: OrderType, baseQuantity: number, options: {
        price?: number;
        stopPrice?: number;
        status?: OrderStatus;
        idOrderBuyed?: string;
    }): Order;
    private adjustQuantity;
    protected cancelInstanceOrders(instance: InstanceController): void;
    protected initializeExchangeInfo(): Promise<void>;
    protected processAccountEvents(event: AccountEvent): void;
    protected processOrdersEvents(eventOrder: Order): boolean;
    protected processBalanceOrderUpdate(eventOrder: Order): void;
    protected updateBalances(eventOrder: Order, oldOrder: Order, base: Balance, quote: Balance): void;
    latenteAndMargin(price: number): number;
    protected generateOrderId(instance: InstanceController): string;
    get availbleBalanceAsset(): Number;
}
//# sourceMappingURL=abstract-controller.d.ts.map