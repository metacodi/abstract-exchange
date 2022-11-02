import { Exchange } from "./abstract-exchange";
import { ExchangeController } from "./exchange-controller";
import { User, AccountMarket, CoinType, FundingWallet, Strategy } from "./types";


export interface ExchangeAccount {
  // Exchange utilitzats 
  exchanges: { [ExchangeType: string]: { apiKey: string; apiSecret: string; apiPassphrase?: string; }; };
  // Estratègies del compte.
  strategies?: Strategy[];
  // Controladors de les estratègies.
  controllers: ExchangeController[];
  // Mercats implicats en les estratègies.
  markets?: { [MarketType: string]: AccountMarket };
  // Fons del compte de l'usuari.
  fondosWallet?: { [CoinType: string]: FundingWallet; };
  /** Referència a les dades de l'usuari. */
  user: User,
  /** Identificador de l'usuari. */
  get idUser(): number;
  /** Paràmetres d'inicialització. */
  config: { [key: string]: any },

  /** Funció per proveïr dels exchanges per cada compte i estratègia. */
  exchangeProvider: (account: ExchangeAccount, strategy: Strategy) => Exchange,
  
  /** Inicialitza el l'execució de les estratègies associades. */
  initialize(): Promise<void>;

  /** Carrega les estratègies associades al compte. */
  loadStrategies(): Promise<Strategy[]>;

  /** Arranca l'estratègia creant les instàncies corresponents. */
  startStrategy(strategy: Strategy): Promise<{ controller: ExchangeController, exchange: Exchange }>;

  /** Instància del controlador que farà anar l'estratègia indicada. */
  createController(executor: Exchange, account: ExchangeAccount, strategy: Strategy): ExchangeController;

  /** Atura l'estratègia. */
  stopStrategy(controller: ExchangeController): Promise<void>;

}
