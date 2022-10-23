import moment from 'moment';
import { Subject } from 'rxjs';
import { Order, OrderId, KlineIntervalType, SymbolType } from './types';
export declare const isSameSymbol: (s1: SymbolType, s2: SymbolType) => boolean;
export declare const timestamp: (inp?: moment.MomentInput) => string;
export declare const splitOrderId: (id: string) => OrderId;
export declare const normalizeId: (id: string) => string;
export declare const findOtherOco: (orders: Order[], id: string) => Order;
export declare const calculateCloseTime: (openTime: string | moment.MomentInput, interval: KlineIntervalType) => string;
export declare const buildChannelKey: (arg: {
    [key: string]: any;
}) => string;
export declare const matchChannelKey: (arg1: {
    [key: string]: any;
}, arg2: {
    [key: string]: any;
}) => boolean;
export declare const isSubjectUnobserved: (emitter: Subject<any>) => boolean;
//# sourceMappingURL=shared.d.ts.map