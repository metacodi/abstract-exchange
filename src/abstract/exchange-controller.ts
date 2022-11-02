import { Exchange } from "./abstract-exchange";
import { ExchangeAccount } from "./exchange-account";
import { AccountMarket, Balance, CoinType, InstanceController, MarketSymbol, MarketType, SimulationData, Strategy, SymbolType } from "./types";


export type ExchangeControllerStatus = 'on' | 'paused' | 'off';

export interface ExchangeController {
  /** Referència al controlador del compte d'usuari. */
  account: ExchangeAccount;
  /** Referència a l'estratègia asignada al controlador. */
  strategy: Strategy;
  /** Referencia a l'exchange asignat al controlador. */
  exchange: Exchange;
  /** Referència a les instàncies de l'estragègia del controlador. */
  instances: InstanceController[];
  /** Balanços globals del controlador. */
  balances: { [key: string]: Balance; };
  /** Informació del símbol de l'exchange. */
  marketSymbol: MarketSymbol;
  /** Indica l'estat d'execució del controlador. */
  status: ExchangeControllerStatus;
  /** Opcions de configuració (isolated). */
  options: { [key: string]: any };

  
  // ---------------------------------------------------------------------------------------------------
  //  Status
  // ---------------------------------------------------------------------------------------------------

  get on(): boolean;

  get off(): boolean;

  get paused(): boolean;

  get readyToStart(): boolean;


  // ---------------------------------------------------------------------------------------------------
  //  Strategy
  // ---------------------------------------------------------------------------------------------------

  get market(): MarketType;

  get symbol(): SymbolType;

  get quoteAsset(): CoinType;

  get baseAsset(): CoinType;
  
  get leverage(): number;


  // ---------------------------------------------------------------------------------------------------
  //  Ids
  // ---------------------------------------------------------------------------------------------------

  get accountId(): string;

  get strategyId(): string;

  get controllerId(): string;


  // ---------------------------------------------------------------------------------------------------
  //  market
  // ---------------------------------------------------------------------------------------------------

  get accountMarket(): AccountMarket;

  // get limitsReady(): boolean;


  // ---------------------------------------------------------------------------------------------------
  //  exchange
  // ---------------------------------------------------------------------------------------------------

  // get marketSymbol(): MarketSymbol;

  fixPrice(price: number): number;

  fixQuantity(quantity: number): number;

  fixBase(base: number): number;

  fixQuote(quote: number): number;

  floorQuantity(quantity: number): number;


  // ---------------------------------------------------------------------------------------------------
  //  simulation
  // ---------------------------------------------------------------------------------------------------

  get simulated(): boolean;

  // get simulator(): Exchange;

  // set simulate(data: SimulationData);

  // protected tickPrice() { if (this.simulated) { this.simulator.tickPrice(); } }

  // protected tickKline() { if (this.simulated) { this.simulator.tickKline(); } }


  // ---------------------------------------------------------------------------------------------------
  //  lifecycle
  // ---------------------------------------------------------------------------------------------------

  start(): boolean;

  pause(): void;

  resume(): boolean;

  stop(): void;

  abort(): void;

}
