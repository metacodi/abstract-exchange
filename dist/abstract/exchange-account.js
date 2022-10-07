"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeAccount = void 0;
const orders_executor_1 = require("./orders-executor");
class ExchangeAccount {
    constructor(info, config, exchangeProvider) {
        this.info = info;
        this.config = config;
        this.exchangeProvider = exchangeProvider;
        this.exchanges = {};
        this.strategies = [];
        this.controllers = [];
        this.markets = {};
        this.fondosWallet = {};
        if (!this.config.initializeManually) {
            this.initialize();
        }
    }
    get idreg() { return this.info.idreg; }
    get folder() { return this.info.folder; }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const strategies = yield this.loadStrategies();
                this.strategies.push(...strategies);
                for (const strategy of strategies) {
                    if (strategy.autoStart) {
                        this.startStrategy(strategy);
                    }
                }
            }
            catch (error) {
                console.error(error);
                throw (error);
            }
        });
    }
    startStrategy(strategy) {
        const exchange = this.exchangeProvider(this, strategy);
        const market = strategy.market;
        if (!this.markets[market]) {
            const executor = new orders_executor_1.OrdersExecutor(this, strategy, exchange, { run: 'async', maxQuantity: 5, period: 1 });
            this.markets[market] = { balances: {}, orders: [], executor, averagePrices: {} };
        }
        const controller = this.createController(this, strategy, exchange);
        this.controllers.push(controller);
        return { controller, exchange };
    }
    stopStrategy(controller) {
        controller.stop();
    }
    get allQuoteAssets() {
        return this.controllers.reduce((assets, controller) => {
            const quoteAsset = controller.quoteAsset;
            if (!assets.includes(quoteAsset)) {
                assets.push(quoteAsset);
            }
            return assets;
        }, []);
    }
    profitAndLoss(quoteAsset, price) {
        return this.controllers.filter(c => c.strategy.symbol.quoteAsset === quoteAsset).reduce((total, controller) => {
            total += controller.latenteAndMargin(price);
            return total;
        }, 0.0);
    }
}
exports.ExchangeAccount = ExchangeAccount;
//# sourceMappingURL=exchange-account.js.map