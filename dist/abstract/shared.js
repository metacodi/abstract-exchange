"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSubjectUnobserved = exports.matchChannelKey = exports.buildChannelKey = exports.calculateCloseTime = exports.findOtherOco = exports.normalizeId = exports.splitOrderId = void 0;
const moment_1 = __importDefault(require("moment"));
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
const calculateCloseTime = (openTime, interval) => {
    const unit = interval.charAt(interval.length - 1);
    const duration = +interval.slice(0, -1);
    const closeTime = (0, moment_1.default)(openTime).add(duration, unit).format('YYYY-MM-DD HH:mm:ss.SSS');
    return closeTime;
};
exports.calculateCloseTime = calculateCloseTime;
const buildChannelKey = (arg) => Object.keys(arg).map(key => arg[key]).join('#');
exports.buildChannelKey = buildChannelKey;
const matchChannelKey = (arg1, arg2) => {
    return Object.keys(arg1).length === Object.keys(arg2).length && Object.keys(arg1).every(key => arg1[key] === arg2[key]);
};
exports.matchChannelKey = matchChannelKey;
const isSubjectUnobserved = (emitter) => { var _a; return !emitter || emitter.closed || !((_a = emitter.observers) === null || _a === void 0 ? void 0 : _a.length); };
exports.isSubjectUnobserved = isSubjectUnobserved;
//# sourceMappingURL=shared.js.map