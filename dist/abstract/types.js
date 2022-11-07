"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userOperationParse = exports.userOperationStringify = void 0;
;
;
;
const userOperationStringify = (row) => {
    const results = ['status', 'entryPrice', 'pnl'];
    const resultsObj = results.reduce((res, prop) => (Object.assign(Object.assign({}, res), { [prop]: row.results[prop] })), {});
    row.results = JSON.stringify(resultsObj);
    return row;
};
exports.userOperationStringify = userOperationStringify;
const userOperationParse = (row) => {
    if (typeof row.results === 'string') {
        row.results = JSON.parse(row.results);
    }
    return row;
};
exports.userOperationParse = userOperationParse;
//# sourceMappingURL=types.js.map