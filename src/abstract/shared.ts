import { Order, OrderId } from "./types";


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

