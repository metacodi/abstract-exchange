import moment from 'moment';
import { Order, OrderId, KlineIntervalType } from './types';
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
//# sourceMappingURL=shared.d.ts.map