import { AbstractController } from "./abstract-controller";
import { AbstractExchange } from "./abstract-exchange";
import { OrdersExecutor } from "./orders-executor";
import { AccountInfo, AccountMarket, CoinType, FundingWallet, Strategy } from "./types";


export abstract class AbstractAccount {
  // Exchange utilitzats 
  exchanges: { [ExchangeType: string]: { apiKey: string; apiSecret: string; apiPassphrase?: string; }; } = {};
  // Estratègies del compte.
  strategies?: Strategy[] = [];
  // Controladors de les estratègies.
  controllers: AbstractController[] = [];
  // Mercats implicats en les estratègies.
  markets?: { [MarketType: string]: AccountMarket } = {};
  // Fons del compte de l'usuari.
  fondosWallet?: { [CoinType: string]: FundingWallet; } = {};

  constructor(
    public info: AccountInfo,
    public config: { [key: string]: any },
    public exchangeProvider: (account: AbstractAccount, strategy: Strategy) => AbstractExchange,
  ) {
    if (!this.config.initializeManually) { this.initialize(); }
  }

  get idreg(): number { return this.info.idreg; }
  
  get folder(): string { return this.info.folder; }
  
  async initialize() {
    try {
      const strategies = await this.loadStrategies();
      this.strategies.push(...strategies);
      for (const strategy of strategies) {
        if (strategy.autoStart) {
          this.startStrategy(strategy);
        }
      }

    // } catch (error) { console.error(error); }
    } catch (error) { console.error(error); throw (error); }
  }

  abstract loadStrategies(): Promise<Strategy[]>;

  protected abstract createController(account: AbstractAccount, strategy: Strategy, executor: AbstractExchange): AbstractController;

  /** Arranca l'estratègia creant les instàncies corresponents. */
  startStrategy(strategy: Strategy) {
    const exchange = this.exchangeProvider(this, strategy);
    // NOTA: Crearem un espai de market independent per cada simulador.
    const market = strategy.market;
    // Comprovem si cal crear un mirror per aquest account/market.
    if (!this.markets[market]) {
      // NOTA: Instanciem un executor de tasques per controlar els límits d'ordres per cada account/market.
      const executor = new OrdersExecutor(this, strategy, exchange, { run: 'async', maxQuantity: 5, period: 1 });
      this.markets[market] = { balances: {}, orders: [], executor, averagePrices: {} };
    }
    const controller = this.createController(this, strategy, exchange);
    this.controllers.push(controller);
    return { controller, exchange };
  }

  /** Atura l'estratègia. */
  stopStrategy(controller: AbstractController) {
    controller.stop();
  }

  get allQuoteAssets(): CoinType[] {
    return this.controllers.reduce((assets, controller) => {
      const quoteAsset = controller.quoteAsset;
      if (!assets.includes(quoteAsset)) { assets.push(quoteAsset); }
      return assets;
    }, [] as CoinType[]);
  }
  
  profitAndLoss(quoteAsset: CoinType, price: number): number { 
    return this.controllers.filter(c => c.strategy.quoteAsset === quoteAsset).reduce((total, controller) => {
      total += controller.latenteAndMargin(price);
      return total;
    }, 0.0);
  }

}
