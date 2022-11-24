"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userOperationStringify = exports.userOperationParse = void 0;
;
;
;
;
const userOperationParse = (row) => {
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
exports.userOperationParse = userOperationParse;
const userOperationStringify = (row) => {
    row.instances = JSON.stringify(row.instances);
    row.results = JSON.stringify(row.results);
    if (row.operation && typeof row.operation.params === 'object') {
        row.operation.params = JSON.stringify(row.operation.params);
    }
    return row;
};
exports.userOperationStringify = userOperationStringify;
//# sourceMappingURL=types.js.map