import moment, { unitOfTime } from 'moment';
import { Subject } from 'rxjs';

import { Order, OrderId, KlineIntervalType } from './types';


export const splitOrderId = (id: string): OrderId => {
  const ids = id.split('-');
  return { accountId: +ids[0], strategyId: +ids[1], instanceId: +ids[2], orderId: +ids[3], ocoId: ids.length > 4 ? ids[4] : undefined };
}

export const normalizeId = (id: string): string => {
  const ids = id.split('-');
  return `${ids[0]}-${ids[1]}-${ids[2]}-${ids[3]}`;
}

export const findOtherOco = (orders: Order[], id: string): Order => {
  // ATENCIÓ: A la instància esperem trobar-hi només les dues oco's. Si no és una, serà l'altra.
  return orders.find(o => o.id !== id);
}

export const calculateCloseTime = (openTime: string | moment.MomentInput, interval: KlineIntervalType): string => {
  const unit = interval.charAt(interval.length - 1) as unitOfTime.DurationConstructor;
  const duration = +interval.slice(0, -1);
  const closeTime = moment(openTime).add(duration, unit).format('YYYY-MM-DD HH:mm:ss.SSS');
  return closeTime;
}


/** Construïm una clau inequívoca pel canal amb els valors dels arguments que el descriuen.
 *
 * ```typescript
 * const args = { channel: 'tickers', instId: 'USDT' };
 * // channelKey => 'tickers#USDT'
 * const channelKey = buildChannelKey(args);
 * ```
 */
export const buildChannelKey = (arg: { [key: string]: any }): string => Object.keys(arg).map(key => arg[key]).join('#');

/** Com que els arguments poden venir en un ordre diferent de quan la channelKey es va crear, necessitem comparar un a un tots els valors de l'objecte. */
export const matchChannelKey = (arg1: { [key: string]: any }, arg2: { [key: string]: any }): boolean => {
  // Han de tenir el mateix nombre de propietats i que tots els seus valors coincideixen.
  return Object.keys(arg1).length === Object.keys(arg2).length && Object.keys(arg1).every(key => arg1[key] === arg2[key]);
}

/** Comprova si un canal té subscriptors. */
export const isSubjectUnobserved = (emitter: Subject<any>): boolean => !emitter || emitter.closed || !emitter.observers?.length;
