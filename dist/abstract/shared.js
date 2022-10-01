"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOtherOco = exports.normalizeId = exports.splitOrderId = void 0;
const splitOrderId = (id) => {
    const ids = id.split('-');
    return { accountId: +ids[0], strategyId: +ids[1], instanceId: +ids[2], orderId: +ids[3], ocoId: ids.length > 4 ? ids[4] : undefined };
};
exports.splitOrderId = splitOrderId;
const normalizeId = (id) => {
    const ids = id.split('-');
    return `${ids[0]}-${ids[1]}-${ids[2]}-${ids[3]}`;
};
exports.normalizeId = normalizeId;
const findOtherOco = (orders, id) => {
    return orders.find(o => o.id !== id);
};
exports.findOtherOco = findOtherOco;
//# sourceMappingURL=shared.js.map