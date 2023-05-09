"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradingStringify = exports.tradingParse = void 0;
;
;
;
;
;
;
const tradingParse = (row) => {
    if (typeof row.instances === 'string') {
        row.instances = JSON.parse(row.instances);
    }
    if (typeof row.results === 'string') {
        row.results = JSON.parse(row.results);
    }
    if (row.operation && typeof row.operation.params === 'string') {
        row.operation.params = JSON.parse(row.operation.params);
    }
    return row;
};
exports.tradingParse = tradingParse;
const tradingStringify = (row) => {
    row.instances = JSON.stringify(row.instances);
    row.results = JSON.stringify(row.results);
    if (row.operation && typeof row.operation.params === 'object') {
        row.operation.params = JSON.stringify(row.operation.params);
    }
    return row;
};
exports.tradingStringify = tradingStringify;
//# sourceMappingURL=types.js.map