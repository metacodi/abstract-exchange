"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const partialOrder = {
    id: '12345',
    exchangeId: '12345678',
    price: 1.1,
};
function updateOrder(order, fieldsToUpdate) {
    const { exchangeId } = fieldsToUpdate, resta = __rest(fieldsToUpdate, ["exchangeId"]);
    return Object.assign(Object.assign({ foo: 'bar' }, order), resta);
}
const markets = {
    'spot': { balances: {}, orders: [], executor: undefined, averagePrices: undefined },
    'margin': { balances: {}, orders: [], executor: undefined, averagePrices: undefined },
    'futures': { balances: {}, orders: [], executor: undefined, averagePrices: undefined },
};
const market = 'spot';
console.log(markets[market].orders.length);
console.log(markets.spot.orders.length);
const stringExtractExample1 = 'a';
const petSampleExtract = {
    type: 'peix',
    name: 'flu-flu',
    swim: true,
};
const petSample2Extract = {
    type: 'gat',
    name: 'lucy',
    color: 'negre',
};
const stringExcludeExample1 = 'b';
//# sourceMappingURL=utility-types.js.map