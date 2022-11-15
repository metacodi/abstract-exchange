import { ApiCredentials } from './exchange-api-types';
import { ExchangeController } from './exchange-controller';
import { User, AccountMarket, FundingWallet, AccountInfo } from './types';
export interface ExchangeAccount {
    credentials: {
        [ExchangeType: string]: ApiCredentials;
    };
    controllers: ExchangeController[];
    markets?: {
        [MarketType: string]: AccountMarket;
    };
    fondosWallet?: {
        [CoinType: string]: FundingWallet;
    };
    user: User;
    get idUser(): number;
    options: {
        [key: string]: any;
    };
}
export declare const mergeAccountInfo: (target: AccountInfo, info: AccountInfo) => AccountInfo;
//# sourceMappingURL=exchange-account.d.ts.map