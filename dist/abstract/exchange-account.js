"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAccountInfo = void 0;
const mergeAccountInfo = (target, info) => {
    var _a, _b;
    if (!target) {
        target = {};
    }
    if (!target.balances) {
        target.balances = [];
    }
    if (!target.positions) {
        target.positions = [];
    }
    const { balances, positions } = target;
    if ((_a = info === null || info === void 0 ? void 0 : info.balances) === null || _a === void 0 ? void 0 : _a.length) {
        info.balances.map(updated => {
            const found = balances.find(b => b.asset === updated.asset);
            if (found) {
                Object.assign(found, updated);
            }
            else {
                balances.push(updated);
            }
        });
    }
    if ((_b = info === null || info === void 0 ? void 0 : info.positions) === null || _b === void 0 ? void 0 : _b.length) {
        info.positions.map(updated => {
            const found = positions.find(p => p.marginAsset === updated.marginAsset);
            if (found) {
                Object.assign(found, updated);
            }
            else {
                positions.push(updated);
            }
        });
    }
    return target;
};
exports.mergeAccountInfo = mergeAccountInfo;
//# sourceMappingURL=exchange-account.js.map