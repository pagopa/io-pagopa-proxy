/**
 * BaseResponse Types
 * Provide common types shared with PagoPaAPI used for communications
 */

import * as t from "io-ts";

export const Schema = t.interface({
  $ref: t.string
});
export type Schema = t.TypeOf<typeof Schema>;

export const Data = t.interface({
  type: t.string,
  items: Schema
});
export type Data = t.TypeOf<typeof Data>;

export const Os = t.interface({
  type: t.string,
  enum: t.array(t.string)
});
export type Os = t.TypeOf<typeof Os>;

export const Properties = t.interface({
  amount: t.number,
  currency: t.string,
  decimalDigits: t.number
});
export type Properties = t.TypeOf<typeof Properties>;

export const AckResult = t.keyof({ OK: "OK", KO: "KO" });
export type AckResult = t.TypeOf<typeof AckResult>;
