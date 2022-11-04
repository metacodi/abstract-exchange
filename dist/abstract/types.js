"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userOperationStringify = void 0;
;
;
;
const userOperationStringify = (row) => {
    const results = ['status', 'entryPrice', 'pnl'];
    const resultsObj = results.reduce((res, prop) => (Object.assign(Object.assign({}, res), { [prop]: row.results[prop] })), {});
    row.results = JSON.stringify(resultsObj);
    results.map(prop => delete row[prop]);
    return row;
};
exports.userOperationStringify = userOperationStringify;
//# sourceMappingURL=types.js.map