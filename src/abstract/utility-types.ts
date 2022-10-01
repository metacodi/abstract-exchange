import { AccountMarket, MarketType, Order, OrderSide, OrderType, ResultOrderStatus } from './types';


/** {@link https://www.typescriptlang.org/docs/handbook/utility-types.html Utility Types} */



// ---------------------------------------------------------------------------------------------------
//  type Partial<T> = { [P in keyof T]?: T[P]; }
// ---------------------------------------------------------------------------------------------------

// const result: Order = {
//   id: '1',
//   exchangeId: 1,
//   type: 'limit',
//   side: 'buy',
//   price: 0.0,
//   quantity: 0.0,
//   // accumulateQuantity: 0.0,
//   status: 'filled',
// };

const partialOrder: Partial<Order> = {
  id: '12345',
  exchangeId: 1,
  price: 1.1,
};

function updateOrder(order: Order, fieldsToUpdate: Partial<Order>) {
  const { exchangeId, ...resta } = fieldsToUpdate;
  return { foo: 'bar', ...order, ...resta };
}

// const result2 = updateOrder(result, partialOrder);


// ---------------------------------------------------------------------------------------------------
//  type Required<T> = { [P in keyof T]-?: T[P]; }
// ---------------------------------------------------------------------------------------------------

// const requiredType: Required<Order> = {
//   id: '1',
//   exchangeId: 1,
//   type: 'limit',
//   side: 'buy',
//   price: 0.0,
//   quantity: 0.0,
//   accumulateQuantity: 0.0, // ara la propietat ja no és opcional
//   status: 'filled',
//   commission: 0.0,
//   commissionAsset: 'BNB',
// };


// ---------------------------------------------------------------------------------------------------
//  type Readonly<T> = { readonly [P in keyof T]: T[P]; }
// ---------------------------------------------------------------------------------------------------

// const readonlyType: Readonly<Order> = {
//   id: '1',
//   exchangeId: 1,
//   type: 'limit',
//   side: 'buy',
//   price: 0.0,
//   quantity: 0.0,
//   status: 'filled',
// };

// readonlyType.id = '12345'; // ara la propietat és readonly


// ---------------------------------------------------------------------------------------------------
//  type Pick<T, K extends keyof T> = { [P in K]: T[P]; }
// ---------------------------------------------------------------------------------------------------

// const pickType: Pick<Order, 'id' | 'price' | 'accumulateQuantity'> = {
//   id: '1',
//   // exchangeId: 1, // ara la propietat ja no forma part del tipus
//   price: 0.0,
//   // accumulateQuantity: 0.0, // la propietat segueix sent opcional
// };


// ---------------------------------------------------------------------------------------------------
//  type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
// ---------------------------------------------------------------------------------------------------

// const omitType: Omit<Order, 'id' | 'price'> = {
//   // id: '1', // ara la propietat ja no forma part del tipus
//   exchangeId: 1,
//   type: 'limit',
//   side: 'buy',
//   // price: 0.0, // ara la propietat ja no forma part del tipus
//   quantity: 0.0,
//   status: 'filled',
//   // accumulateQuantity: 0.0, // ara la propietat ja no forma part del tipus
// };


// ---------------------------------------------------------------------------------------------------
//  type Record<K extends keyof any, T> = { [P in K]: T; }
// ---------------------------------------------------------------------------------------------------

const markets: Record<MarketType, AccountMarket> = {
  'spot': { balances: {}, orders: [], executor: undefined, averagePrices: undefined },
  'margin': { balances: {}, orders: [], executor: undefined, averagePrices: undefined },
  'futures': { balances: {}, orders: [], executor: undefined, averagePrices: undefined },
};

const market: MarketType = 'spot';
console.log(markets[market].orders.length);
console.log(markets.spot.orders.length);


// ---------------------------------------------------------------------------------------------------
//  type Extract<T, U> = T extends U ? T : never;
// ---------------------------------------------------------------------------------------------------

type stringUnionType1 = 'a' | 'b' | 'c' | 'd';
type stringUnionType2 = 'a' | 'd' | 'z';
type stringExtract = Extract<stringUnionType1, stringUnionType2>;
const stringExtractExample1: stringExtract = 'a';

// ---------------------------------------------------------------------------------------------------

type unionDifferentTypes = string | number | ((...args: number[]) => number) | (() => void);

type functionExtract = Extract<unionDifferentTypes, Function>;

type numberAndfunctionExtract = Extract<unionDifferentTypes, Function | number>;

// ---------------------------------------------------------------------------------------------------

interface foo { bar: string; }
interface pet { name: string; }
interface animal { type: string; }
interface fish extends pet, animal { swim: boolean; }
interface cat extends pet, animal { color: string; }

type petFishExtract = Extract<fish, pet>
type petNeverExtract = Extract<pet, fish>
type petAllExtract = Extract<fish | cat | foo, animal>
const petSampleExtract: petAllExtract = {
  type: 'peix',
  name: 'flu-flu',
  swim: true,
};
const petSample2Extract: petAllExtract = {
  type: 'gat',
  name: 'lucy',
  color: 'negre',
};


// ---------------------------------------------------------------------------------------------------
//  type Exclude<T, U> = T extends U ? never : T;
// ---------------------------------------------------------------------------------------------------

type stringExclude = Exclude<stringUnionType1, stringUnionType2>;
const stringExcludeExample1: stringExclude = 'b';

// ---------------------------------------------------------------------------------------------------

type functionExclude = Exclude<unionDifferentTypes, Function>;

type numberAndfunctionExclude = Exclude<unionDifferentTypes, Function | number>;

// ---------------------------------------------------------------------------------------------------

// type petNeverExclude = Exclude<fish, animal>
// type petExclude = Exclude<pet, fish | cat | foo>
// type animalExclude = Exclude<animal, fish | cat | foo>
// const petSampleExclude: petExclude = {
//   // type: 'peix',
//   name: 'flu-flu',
//   // swim: true,
// };
// const animalSampleExclude: animalExclude = {
//   type: 'gat',
//   // name: 'lucy',
//   // color: 'negre',
// };


// ---------------------------------------------------------------------------------------------------
//  type NonNullable<T> = T extends null | undefined ? never : T;
// ---------------------------------------------------------------------------------------------------

type nonNullableType = NonNullable<string | number | undefined | null>;



/** {@link https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html Template Literal Types} */

// ---------------------------------------------------------------------------------------------------
//  type Uppercase<S extends string> = intrinsic;
//  type Lowercase<S extends string> = intrinsic;
//  type Capitalize<S extends string> = intrinsic;
//  type Uncapitalize<S extends string> = intrinsic;
// ---------------------------------------------------------------------------------------------------

type upperType = Uppercase<MarketType>;
type lowerType = Lowercase<upperType>;
type capitalizeType = Capitalize<MarketType>;
type uncapitalizeType = Uncapitalize<upperType>;


// ---------------------------------------------------------------------------------------------------
//  Template Literal Types
// ---------------------------------------------------------------------------------------------------

type world = 'world' | 'moon';
type greeting = `hello ${world}`;

type lang = 'en' | 'ca' | 'pt';
type greetingLang = `${places}_${lang}`;

type places = 'office' | 'home';
type interpolatedUnion = `hello_${world | places}`;
