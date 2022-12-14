import { ApiCredentials } from './exchange-api-types';
import { ExchangeController } from './exchange-controller';
import { User, AccountMarket, FundingWallet, AccountInfo } from './types';


export interface ExchangeAccount {
  /** Exchange utilitzats. */
  credentials: { [ExchangeType: string]: ApiCredentials; };
  /** Controladors de les estratègies. */
  controllers: ExchangeController[];
  /** Mercats implicats en les estratègies. */
  markets?: { [MarketType: string]: AccountMarket };
  /** Fons del compte de l'usuari. */
  fondosWallet?: { [CoinType: string]: FundingWallet; };
  /** Referència a les dades de l'usuari. */
  user: User;
  /** Identificador de l'usuari. */
  get idUser(): number;
  /** Paràmetres d'inicialització. */
  options: { [key: string]: any };

  // /** Funció per proveïr dels exchanges per cada compte i estratègia. */
  // exchangeProvider: (account: ExchangeAccount, strategy: Strategy) => AbstractExchange,
  
  // /** Inicialitza el l'execució de les estratègies associades. */
  // initialize(): Promise<void>;

  // /** Carrega les estratègies associades al compte. */
  // loadStrategies(): Promise<Strategy[]>;

  // /** Arranca l'estratègia creant les instàncies corresponents. */
  // startStrategy(strategy: Strategy): Promise<{ controller: ExchangeController, exchange: AbstractExchange }>;

  // /** Instància del controlador que farà anar l'estratègia indicada. */
  // createController(executor: AbstractExchange, account: ExchangeAccount, strategy: Strategy): ExchangeController;

  // /** Atura l'estratègia. */
  // stopStrategy(controller: ExchangeController): Promise<void>;

}


export const mergeAccountInfo = (target: AccountInfo, info: AccountInfo) => {
  if (!target) { target = {}; }
  if (!target.balances) { target.balances = []; }
  if (!target.positions) { target.positions = []; }
  const { balances, positions } = target;
  if (info?.balances?.length) {
    info.balances.map(updated => {
      const found = balances.find(b => b.asset === updated.asset);
      if (found) { Object.assign(found, updated); } else { balances.push(updated); }
    });
  }
  if (info?.positions?.length) {
    info.positions.map(updated => {
      const found = positions.find(p => p.marginAsset === updated.marginAsset);
      if (found) { Object.assign(found, updated); } else { positions.push(updated); }
    });
  }
  return target;
};
